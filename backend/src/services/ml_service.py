from pathlib import Path
from typing import Any, Dict, Tuple
import joblib # type: ignore[import-untyped]
import numpy as np
import shap # type: ignore[import-untyped]

MODEL_PATH = (
    Path(__file__).resolve().parent.parent / "ml_models" / "modelo_biomarcadores_v1.joblib"
)


# transformacion de inputs
def transform(x):
    return np.log10(np.asarray(x, dtype=float) + 1)


class MLService:

    def __init__(self, model_path: Path = MODEL_PATH):
        self.model_path = model_path
        self.artifact: Any = None
        self.pipeline: Any = None
        self.required_variables: list[str] = []
        self._load_model()

    def _load_model(self):
        if not self.model_path.exists():
            raise FileNotFoundError(f"No se encontró el archivo del modelo en: {self.model_path}")

        self.artifact = joblib.load(self.model_path)
        self.pipeline = self.artifact["pipeline"]
        self.required_variables = self.artifact["variables"]

    def predict(
        self, input_data: Dict[str, Any]
    ) -> Tuple[str, float, Dict[str, float], Dict[str, float]]:
        # validar biomarcadores
        missing_keys = [var for var in self.required_variables if var not in input_data]
        if missing_keys:
            raise ValueError(f"Faltan {' '.join(missing_keys)} biomarcadores")

        # emparejamiento de biomarcadores exacto al entrenamiento (evitar mala prediccion)
        feature_vector = [float(input_data[var]) for var in self.required_variables]
        X = np.array(feature_vector).reshape(1, -1)

        # probabilidad de prediccion y clase
        prediction_int = int(self.pipeline.predict(X)[0])
        probabilities = self.pipeline.predict_proba(X)[0]

        prediction_label = "Positivo" if prediction_int == 1 else "Negativo"
        probability = float(probabilities[prediction_int])

        # calculo de explicabilidad SHAP
        X_transformed = X
        for _, step_obj in self.pipeline.steps[:-1]:
            X_transformed = step_obj.transform(X_transformed)

        classifier = self.pipeline.steps[-1][1]
        explainer = shap.LinearExplainer(classifier, mask=np.zeros((1, X_transformed.shape[1])))
        shap_values = explainer.shap_values(X_transformed)

        if isinstance(shap_values, list):
            vals = shap_values[prediction_int][0]
        elif len(shap_values.shape) == 2:
            vals = shap_values[0]
        else:
            vals = shap_values[0][:, prediction_int]

        # mostrar biomarcadores con mayor peso
        biomarker_impact = dict(zip(self.required_variables, vals))
        top_biomarkers = dict(
            sorted(
                biomarker_impact.items(),
                key=lambda item: abs(item[1]),
                reverse=True,
            )
        )
        all_biomarkers = {k: round(float(v), 4) for k, v in top_biomarkers.items()}

        # mostrar el top 5 de los biomarcadores con mayor peso
        top_biomarkers = dict(list(all_biomarkers.items())[:5])

        return prediction_label, probability, top_biomarkers, all_biomarkers

ml_service = MLService()