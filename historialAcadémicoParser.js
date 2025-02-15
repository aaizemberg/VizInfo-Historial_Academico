const período = Array.from(document.querySelectorAll('div > p > span')).map(p => p.textContent)
const historialAcadémico = Array.from(document.querySelectorAll('tbody')).map((table, idx) => {
  const materias = []
  for (const row of table.rows) {
    const [cod_nom, créditos, comisión] = Array.from(row.cells[1].querySelectorAll('span')).map(span => span.textContent)
    const [código, nombre] = cod_nom.split(' - ')
    const cursada = row.cells[2].querySelector('span > span').textContent
    const finales = Array.from(row.cells[3].querySelectorAll('div > div')).map(div => parseFinal(div))
    materias.push({
      código,
      nombre,
      comisión,
      créditos: parseInt(créditos),
      cursada: parseCursada(cursada),
      finales,
    })
  }
  return {
    cuatrimestre: /Primer/.test(período[idx]) ? 1 : 2,
    año: parseInt(período[idx].match(/\d{4}/)),
    materias,
  }
}
)

function formatDate(date_ar) {
  const [_, day, month, year] = date_ar.match(/(\d{2}).(\d{2}).(\d{4})/) || []
  return day ? `${year}-${month}-${day}` : null
}

function parseCursada(cursada) {
  const nota = parseFloat(cursada) || null
  let estado = ''
  if (!nota) estado = cursada
  else if (nota >= 4) estado = 'Aprobado'
  else estado = 'Desaprobado'

  return { nota, estado }
}

function parseFinal(finalDiv) {
  const [nota_estado, fecha] = Array.from(finalDiv.querySelectorAll('span')).map(span => span.textContent)
  const nota = parseFloat(nota_estado) || null
  let estado = ''
  if (!nota) estado = nota_estado
  else if (nota >= 4) estado = 'Aprobado'
  else estado = 'Desaprobado'

  return {
    nota,
    estado,
    fecha: formatDate(fecha),
  }
}

const json = JSON.stringify(historialAcadémico, null, 2)
const blob = new Blob([json], { type: 'text/plain;charset=utf-8' })
const downloadJson = document.createElement('a')
downloadJson.href = URL.createObjectURL(blob)
downloadJson.download = 'historialAcadémico.json'
downloadJson.textContent = 'Descargar historial académico'
downloadJson.style.display = 'block'
// const jsonNode = document.createElement('p')
// jsonNode.textContent = json
// jsonNode.style.whiteSpace = 'pre-wrap'
// document.body.replaceChildren(jsonNode, download)

function generateCSVs() {
  const materiasArr = ['código,nombre,créditos,comisión,cuatrimestre,año']
  const cursadasArr = ['código,nota,estado']
  const finalesArr = ['código,fecha,nota,estado']

  historialAcadémico.forEach(({ cuatrimestre, año, materias }) => {
    materias.forEach(materia => {
      materiasArr.push(`${materia.código},${materia.nombre},${materia.créditos},${materia.comisión},${cuatrimestre},${año}`)
      cursadasArr.push(`${materia.código},${materia.cursada.nota},${materia.cursada.estado}`)
      materia.finales.forEach(final => {
        finalesArr.push(`${materia.código},${final.fecha},${final.nota},${final.estado}`)
      })
    })
  })

  return {
    materias: materiasArr.join('\n'),
    cursadas: cursadasArr.join('\n'),
    finales: finalesArr.join('\n'),
  }
}

const CSVs = generateCSVs()
const csvDownloadNodes = []
for (const file in CSVs) {
  const blob = new Blob([CSVs[file]], { type: 'text/plain;charset=utf-8' })
  const downloadCSV = document.createElement('a')
  downloadCSV.href = URL.createObjectURL(blob)
  downloadCSV.download = file + '.csv'
  downloadCSV.textContent = 'Descargar ' + downloadCSV.download
  downloadCSV.style.display = 'block'
  csvDownloadNodes.push(downloadCSV)
}

document.body.replaceChildren(downloadJson, ...csvDownloadNodes)
