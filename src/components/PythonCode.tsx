import catalog from "@/data/python-catalog.json";

const outputs: Record<string, string> = {
  Y: "Una cadena mínima (str).",
  P: "Un diccionario con cost y presses; ambos son None cuando no hay solución.",
  Q: "La esperanza de movimientos (float).",
  W: "Una lista de tres cantidades enteras, o None si las respuestas son incompatibles.",
  U: "La cadena de piezas S/L/R. check_track comprueba su recorrido por separado.",
  S: "El coste mínimo dp[N][0]. La tabla es una estructura interna.",
  R: "Un booleano que indica si el objetivo es alcanzable. Los bloques se calculan internamente.",
  X: "Un diccionario con possible y firstFailure; la primera acción incompatible se cuenta desde 1.",
  T: "La distancia mínima aproximada (float).",
  V: "Un diccionario con minimum y maximum.",
  Z: "Una lista de vectores de palancas que reproduce la distribución recibida.",
};

export default function PythonCode({ id }: { id: string }) {
  const source = (
    catalog as Record<string, { name: string; path: string; code: string }>
  )[id];
  return (
    <div className="python-reference">
      <p>
        <strong>Salida en Python:</strong> {outputs[id]}
      </p>
      <p>
        Python 3.10 o posterior · implementación completa con comentarios y un
        ejemplo al final. Usa únicamente la biblioteca estándar.
      </p>
      <p className="small">
        Versión contrastada localmente con los solucionadores TypeScript. Las
        explicaciones del pseudocódigo se aplican a ambos lenguajes; las trazas
        y los ejercicios actuales usan TypeScript.
      </p>
      <pre
        className="source-code"
        tabIndex={0}
        aria-label={`Código Python de ${source.path}`}
      >
        <code>
          {source.code.split("\n").map((line, i) => (
            <span key={i}>
              <span className="source-number" aria-hidden="true">
                {i + 1}
              </span>
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
      <p>
        <a
          href={`/reference/python/${source.name}.py.txt`}
          download={`${source.name}.py`}
        >
          Descargar {source.path}
        </a>
      </p>
      <p className="small">
        Guarda el archivo y ejecuta <code>python {source.name}.py</code> para
        probar el ejemplo. La función recibe los datos ya leídos; el ejemplo no
        implementa un protocolo de juez.
      </p>
    </div>
  );
}
