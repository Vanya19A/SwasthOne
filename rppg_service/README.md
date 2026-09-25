# SwasthOne exact V2 rPPG service

This folder contains the **exact tested `swasthone_rppg_FINAL_V2.py`** plus only the
toolbox method modules that it imports at runtime.

## What is frozen

Do not edit `swasthone_rppg_FINAL_V2.py`. Its SHA-256 is recorded in
`V2_SHA256.txt`.

The rPPG algorithms, ROI definitions, candidate extraction, temporal consensus,
TrustScore weights and thresholds are not reimplemented in the browser.

## Runtime flow

Browser camera -> 30-second MediaRecorder capture -> this service -> exact V2
engine -> JSON result -> SwasthOne frontend -> existing `/api/rppg` persistence.

## Start

From this folder, using the **same `rppg-toolbox` Python environment used to validate V2**:

```powershell
pip install -r requirements.txt
python service.py
```

The service listens on `http://localhost:8000`.

Health check:

```text
http://localhost:8000/health
```

The frontend can override the service URL with:

```text
VITE_RPPG_API_URL=http://localhost:8000
```

## Dependency policy

The original 311 MB rPPG-Toolbox is **not copied wholesale** into SwasthOne.
Only these runtime files are included:

- POS_WANG.py
- CHROME_DEHAAN.py
- ICA_POH.py
- GREEN.py
- LGI.py
- PBV.py
- OMIT.py
- unsupervised_methods/utils.py

No toolbox trainer, dataset, neural model, CUDA package, or unrelated code is
required by this V2 service.

Do not upgrade/reinstall NumPy, SciPy, OpenCV or the toolbox dependencies just for this service. The V2 was validated in that environment; only Flask and Flask-CORS are added by `requirements.txt`.
