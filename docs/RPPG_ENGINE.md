# SwasthOne rPPG Engine — Milestone 4 + Exact V2 Integration

## Runtime pipeline

Browser camera -> 30-second browser recording -> Python rPPG service -> exact
`swasthone_rppg_FINAL_V2.py` -> V2 result -> SwasthOne TrustScore -> triage.

The browser no longer reimplements rPPG signal processing. The Python service is
the adapter between the browser camera and the frozen V2 engine.

## V2 pipeline

Camera frames -> face tracking -> 3 facial ROIs
-> 7 unsupervised rPPG methods (POS/CHROM primary, others supporting)
-> multi-peak spectral candidates -> overlapping temporal windows
-> cross-method + cross-region candidate consensus
-> TrustScore -> ACCEPT / RETAKE.

The tested V2 source is kept unchanged in `rppg_service/swasthone_rppg_FINAL_V2.py`.
Its SHA-256 is recorded in `rppg_service/V2_SHA256.txt`.

## Dependency policy

The complete 311 MB rPPG-Toolbox is not copied into SwasthOne. Only the toolbox
modules directly required by V2 are included:

- POS_WANG
- CHROME_DEHAAN
- ICA_POH
- GREEN
- LGI
- PBV
- OMIT
- the toolbox `unsupervised_methods/utils.py`

No neural trainer, dataset, CUDA dependency, or unrelated toolbox module is
required by the integrated V2 service.

## TrustScore

V2 combines spectral signal quality, temporal stability, cross-method agreement,
cross-region agreement, motion stability and lighting stability. Its existing
thresholds and weights are preserved.

TrustScore is measurement-quality confidence, not a medical risk score. The
pipeline is a prototype screening/engineering implementation and is not
clinically validated.

## Browser camera

The browser handles camera permission and recording. The recording is sent to
the local Python service for decoding and processing. This replaces only the
camera/input adapter; it does not reimplement or alter the V2 signal-processing
algorithm.

## ICA

The V2 code is intentionally left unchanged, including its current ICA behavior
and any runtime warning it may emit. No ICA correction is introduced as part of
this integration.
