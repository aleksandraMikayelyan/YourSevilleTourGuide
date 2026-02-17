export const generateTourReportHTML = (
  tourTitle: string,
  stops: Array<{
    title: string;
    description?: string;
    stop_order: number;
  }>,
  coverImageUrl?: string,
): string => {
  let html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tourTitle} - Informe de Paradas</title>
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1e1b4b; /* Indigo oscuro */
    line-height: 1.6;
  }

  /* Contenedor principal sin bordes para que luzca como una revista */
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 60px 50px;
  }

  .header {
    text-align: left; /* Alineación moderna a la izquierda */
    margin-bottom: 50px;
    border-left: 8px solid #4f46e5;
    padding-left: 25px;
  }

  h1 {
    color: #1e1b4b;
    font-size: 42px;
    font-weight: 900;
    margin: 0;
    letter-spacing: -1.5px;
    text-transform: capitalize;
  }

  .subtitle {
    color: #6366f1; /* Indigo vibrante */
    font-size: 20px;
    font-weight: 700;
    margin-top: 5px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .cover-image {
    width: 100%;
    height: 350px;
    object-fit: cover;
    border-radius: 24px; /* Bordes muy redondeados tipo app pro */
    margin: 20px 0 40px 0;
    box-shadow: 0 20px 40px rgba(79, 70, 229, 0.15);
  }

  h2 {
    color: #1e1b4b;
    font-size: 28px;
    font-weight: 800;
    margin: 50px 0 30px 0;
    display: flex;
    align-items: center;
  }

  h2::after {
    content: "";
    flex: 1;
    height: 2px;
    background: linear-gradient(to right, #4f46e5, transparent);
    margin-left: 20px;
  }

  .stop-list { margin: 0; padding: 0; }

  .stop-item {
    margin: 30px 0;
    padding: 30px;
    background: #f8faff; /* Fondo azulado muy tenue */
    border-radius: 20px;
    position: relative;
    page-break-inside: avoid; /* Evita que una parada se corte entre páginas */
    border: 1px solid #eef2ff;
  }

  .stop-number {
    position: absolute;
    top: 25px;
    right: 25px; /* Número a la derecha para un look editorial */
    background: #7c3aed; /* Violeta */
    color: white;
    width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 20px;
    box-shadow: 0 8px 15px rgba(124, 58, 237, 0.3);
    transform: rotate(5deg); /* Toque de diseño rebelde */
  }

  .stop-title {
    font-size: 24px;
    font-weight: 800;
    color: #4f46e5;
    margin: 0 0 15px 0;
    padding-right: 50px; /* Para que no choque con el número */
  }

  .stop-desc {
    margin: 0;
    color: #475569;
    font-size: 16px;
    line-height: 1.8;
    text-align: justify;
  }

  /* Footer elegante con branding */
  .footer {
    text-align: center;
    margin-top: 80px;
    padding-top: 30px;
    border-top: 2px solid #f1f5f9;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  /* Decoración extra para el PDF */
  .brand-dot {
    color: #7c3aed;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${tourTitle}</h1>
      <p class="subtitle">Informe de paradas del tour</p>
      ${coverImageUrl ? `<img src="${coverImageUrl}" class="cover-image" alt="Portada del tour">` : ""}
    </div>

    <h2>Paradas registradas (${stops.length})</h2>

    <div class="stop-list">
  `;

  if (stops.length === 0) {
    html += `
      <p style="text-align:center; color:#888; font-style:italic;">
        No hay paradas registradas en este tour.
      </p>
    `;
  } else {
    stops.forEach((stop, index) => {
      html += `
        <div class="stop-item">
          <div class="stop-number">${stop.stop_order || index + 1}</div>
          <h3 class="stop-title">${stop.title}</h3>
          <p class="stop-desc">${stop.description?.trim() || "Sin descripción disponible."}</p>
        </div>
      `;
    });
  }

  html += `
    </div>

    <div class="footer">
      Generado desde la app el ${new Date().toLocaleDateString("es-ES")} • ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
    </div>
  </div>
</body>
</html>`;

  return html;
};
