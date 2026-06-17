import io

import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev origin
    allow_methods=["*"],
    allow_headers=["*"],
)


def _parse_dates(series: pd.Series) -> pd.Series:
    nums = pd.to_numeric(series, errors="coerce")
    from_serial = pd.to_datetime(
        nums, unit="D", origin="1899-12-30", errors="coerce"
    )
    from_string = pd.to_datetime(
        series.where(nums.isna()), dayfirst=True, errors="coerce"
    )
    return from_serial.fillna(from_string).dt.strftime("%Y-%m-%d")


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.post("/imports")
async def create_import(file: UploadFile):
    if not file.filename or not file.filename.lower().endswith(".xlsb"):
        raise HTTPException(status_code=400, detail="Ожидается файл .xlsb")

    contents = await file.read()

    try:
        df = pd.read_excel(
            io.BytesIO(contents),
            engine="pyxlsb",
            header=1,
            skiprows=[2],
        )
    except Exception as exc:  
        raise HTTPException(
            status_code=400, detail=f"Не удалось прочитать файл: {exc}"
        ) from exc

    df = df.dropna(axis=1, how="all")

    for col in df.columns:
        if isinstance(col, str) and col.startswith("Дата"):
            df[col] = _parse_dates(df[col])

    df = df.astype(object).where(pd.notnull(df), None)
    print(df)

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "size": len(contents),
        "df": df,
    }
