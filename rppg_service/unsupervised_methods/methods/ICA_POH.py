"""
ICA
Non-contact, automated cardiac pulse measurements using video imaging
and blind source separation.

Based on:
Poh, M. Z., McDuff, D. J., & Picard, R. W. (2010).
Optics Express, 18(10), 10762-10774.
"""

import math
import numpy as np
from scipy import linalg, signal
from unsupervised_methods import utils


def ICA_POH(frames, FS):
    """
    Estimate blood volume pulse using ICA.

    Parameters
    ----------
    frames : list[np.ndarray]
        Video frames containing the ROI.
    FS : float
        Sampling frequency / effective FPS.

    Returns
    -------
    np.ndarray
        Estimated BVP signal.
    """

    if frames is None or len(frames) < 10:
        raise ValueError("Not enough frames for ICA")

    if FS is None or FS <= 0:
        raise ValueError("Invalid sampling frequency")

    # Band-pass limits
    LPF = 0.7
    HPF = 2.5

    RGB = process_video(frames)

    if RGB.ndim != 2 or RGB.shape[1] != 3:
        raise ValueError(
            f"Expected RGB signal with shape (N, 3), got {RGB.shape}"
        )

    # Nyquist frequency
    NyquistF = FS / 2.0

    if HPF >= NyquistF:
        raise ValueError(
            f"Sampling frequency {FS:.2f} FPS is too low for "
            f"{HPF} Hz upper cutoff"
        )

    # Normalize RGB channels
    BGRNorm = np.zeros_like(RGB, dtype=np.float64)

    Lambda = 100

    for c in range(3):
        channel = RGB[:, c].astype(np.float64)

        BGRDetrend = utils.detrend(channel, Lambda)

        std = np.std(BGRDetrend)

        if std < 1e-12:
            raise ValueError(
                f"RGB channel {c} has insufficient variation"
            )

        BGRNorm[:, c] = (
            BGRDetrend - np.mean(BGRDetrend)
        ) / std

    # ICA expects:
    # rows    = channels
    # columns = observations
    X = BGRNorm.T

    _, S = ica(X, 3)

    S = np.asarray(S, dtype=np.float64)

    if S.ndim != 2:
        raise ValueError(f"Unexpected ICA output shape: {S.shape}")

    # Ensure shape = (3, N)
    if S.shape[0] != 3 and S.shape[1] == 3:
        S = S.T

    if S.shape[0] != 3:
        raise ValueError(
            f"ICA produced invalid source shape: {S.shape}"
        )

    # ---------------------------------------------------------
    # Select the component with the strongest cardiac frequency
    # ---------------------------------------------------------

    MaxPx = np.zeros(3)

    for c in range(3):

        component = np.asarray(S[c]).flatten()

        if len(component) < 10:
            continue

        FF = np.fft.rfft(component)

        freqs = np.fft.rfftfreq(
            len(component),
            d=1.0 / FS
        )

        power = np.abs(FF) ** 2

        valid = (
            (freqs >= LPF) &
            (freqs <= HPF)
        )

        if not np.any(valid):
            continue

        cardiac_power = power[valid]

        total_power = np.sum(cardiac_power)

        if total_power <= 1e-12:
            continue

        normalized_power = cardiac_power / total_power

        MaxPx[c] = np.max(normalized_power)

    MaxComp = int(np.argmax(MaxPx))

    BVP_I = np.asarray(
        S[MaxComp],
        dtype=np.float64
    ).flatten()

    # ---------------------------------------------------------
    # Band-pass filtering
    # ---------------------------------------------------------

    low = LPF / NyquistF
    high = HPF / NyquistF

    B, A = signal.butter(
        3,
        [low, high],
        btype="bandpass"
    )

    # filtfilt needs enough samples
    min_required = 3 * max(len(A), len(B)) + 1

    if len(BVP_I) <= min_required:
        raise ValueError(
            f"Not enough samples for filtering: "
            f"{len(BVP_I)} < {min_required}"
        )

    BVP_F = signal.filtfilt(
        B,
        A,
        BVP_I
    )

    return np.asarray(
        BVP_F,
        dtype=np.float64
    ).flatten()


def process_video(frames):
    """
    Calculate average RGB value for every frame.

    Returns
    -------
    np.ndarray
        Shape: (N, 3)
    """

    RGB = []

    for frame in frames:

        if frame is None:
            continue

        frame = np.asarray(frame)

        if frame.ndim != 3 or frame.shape[2] != 3:
            continue

        # Mean RGB/BGR channels
        mean_value = np.mean(
            frame,
            axis=(0, 1)
        )

        RGB.append(mean_value)

    if len(RGB) == 0:
        raise ValueError("No valid frames")

    RGB = np.asarray(
        RGB,
        dtype=np.float64
    )

    if RGB.ndim != 2 or RGB.shape[1] != 3:
        raise ValueError(
            f"Invalid RGB signal shape: {RGB.shape}"
        )

    return RGB


def ica(X, Nsources, Wprev=None):

    X = np.asarray(
        X,
        dtype=np.complex128
    )

    if X.ndim != 2:
        raise ValueError(
            f"ICA input must be 2-D, got {X.shape}"
        )

    nRows, nCols = X.shape

    if nRows > nCols:
        raise ValueError(
            "ICA input must have shape "
            "(channels, observations)"
        )

    if Nsources > min(nRows, nCols):
        Nsources = min(nRows, nCols)

    Winv, Zhat = jade(
        X,
        Nsources,
        Wprev
    )

    W = np.linalg.pinv(Winv)

    return W, Zhat


def jade(X, m, Wprev=None):

    X = np.asarray(
        X,
        dtype=np.complex128
    )

    n = X.shape[0]
    T = X.shape[1]

    if T < 10:
        raise ValueError("Not enough observations for ICA")

    nem = m

    seuil = 1.0 / math.sqrt(T) / 100.0

    # ---------------------------------------------------------
    # Whitening
    # ---------------------------------------------------------

    covariance = (
        X @ X.conj().T
    ) / T

    D, U = np.linalg.eigh(covariance)

    D = np.real(D)

    D = np.maximum(
        D,
        1e-12
    )

    order = np.argsort(D)

    selected = order[-m:]

    eigenvalues = D[selected]

    eigenvectors = U[:, selected]

    inv_sqrt = 1.0 / np.sqrt(
        eigenvalues
    )

    sqrt_values = np.sqrt(
        eigenvalues
    )

    W = (
        np.diag(inv_sqrt)
        @ eigenvectors.conj().T
    )

    IW = (
        eigenvectors
        @ np.diag(sqrt_values)
    )

    Y = W @ X

    # ---------------------------------------------------------
    # Covariance matrices
    # ---------------------------------------------------------

    R = (
        Y @ Y.conj().T
    ) / T

    C = (
        Y @ Y.T
    ) / T

    # ---------------------------------------------------------
    # Fourth-order cumulant matrix
    # ---------------------------------------------------------

    Q = np.zeros(
        (m * m, m * m),
        dtype=np.complex128
    )

    index = 0

    for lx in range(m):

        Y1 = Y[lx, :]

        for kx in range(m):

            Yk1 = (
                Y1 *
                np.conj(Y[kx, :])
            )

            for jx in range(m):

                Yjk1 = (
                    Yk1 *
                    np.conj(Y[jx, :])
                )

                for ix in range(m):

                    value = (
                        np.sum(
                            Yjk1 *
                            Y[ix, :]
                        ) / T
                    )

                    value -= (
                        R[ix, jx] *
                        R[lx, kx]
                    )

                    value -= (
                        R[ix, kx] *
                        R[lx, jx]
                    )

                    value -= (
                        C[ix, lx] *
                        np.conj(
                            C[jx, kx]
                        )
                    )

                    Q[index // (m * m),
                      index % (m * m)] = value

                    index += 1

    # ---------------------------------------------------------
    # Eigen decomposition
    # ---------------------------------------------------------

    D, U = np.linalg.eig(Q)

    Diag = np.abs(D)

    K = np.argsort(Diag)

    M = np.zeros(
        (m, nem * m),
        dtype=np.complex128
    )

    h = m * m - 1

    for u in range(
        0,
        nem * m,
        m
    ):

        Z = U[:, K[h]].reshape(
            (m, m)
        )

        M[:, u:u + m] = (
            Diag[K[h]] * Z
        )

        h -= 1

    # ---------------------------------------------------------
    # Joint diagonalisation
    # ---------------------------------------------------------

    B = np.array(
        [
            [1, 0, 0],
            [0, 1, 1],
            [0, -1j, 1j],
        ],
        dtype=np.complex128
    )

    Bt = B.conj().T

    encore = True

    if Wprev is None:
        V = np.eye(
            m,
            dtype=np.complex128
        )
    else:
        V = np.linalg.inv(Wprev)

    while encore:

        encore = False

        for p in range(m - 1):

            for q in range(p + 1, m):

                Ip = np.arange(
                    p,
                    nem * m,
                    m
                )

                Iq = np.arange(
                    q,
                    nem * m,
                    m
                )

                g = np.vstack(
                    [
                        M[p, Ip] -
                        M[q, Iq],

                        M[p, Iq],

                        M[q, Ip],
                    ]
                )

                temp1 = (
                    g @ g.conj().T
                )

                temp2 = (
                    B @ temp1
                )

                temp = (
                    temp2 @ Bt
                )

                D, vcp = np.linalg.eigh(
                    np.real(temp)
                )

                order = np.argsort(D)

                angles = vcp[
                    :,
                    order[-1]
                ]

                if angles[0] < 0:
                    angles = -angles

                c = np.sqrt(
                    max(
                        0.0,
                        0.5 +
                        angles[0] / 2.0
                    )
                )

                if abs(c) < 1e-12:
                    continue

                s = (
                    0.5 *
                    (
                        angles[1]
                        - 1j * angles[2]
                    )
                    / c
                )

                if abs(s) > seuil:

                    encore = True

                    pair = [
                        p,
                        q
                    ]

                    G = np.array(
                        [
                            [
                                c,
                                -np.conj(s)
                            ],
                            [
                                s,
                                c
                            ],
                        ],
                        dtype=np.complex128
                    )

                    V[:, pair] = (
                        V[:, pair] @ G
                    )

                    M[pair, :] = (
                        G.conj().T @
                        M[pair, :]
                    )

                    temp1 = (
                        c * M[:, Ip]
                        + s * M[:, Iq]
                    )

                    temp2 = (
                        -np.conj(s) *
                        M[:, Ip]
                        + c *
                        M[:, Iq]
                    )

                    M[:, Ip] = temp1
                    M[:, Iq] = temp2

    # ---------------------------------------------------------
    # Final source separation
    # ---------------------------------------------------------

    A = IW @ V

    S = (
        V.conj().T @ Y
    )

    return A, S
