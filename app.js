// I. Configuración
//Selecciona el ID graf del html index
graf = d3.select('#graf')


//delimitamos el ancho total del espacio para graficar
ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

//acomodamos el grafico al tamaño total de ancho y alto 
graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

// definimos los margenes
margins = { top: 30, left: 70, right: 15, bottom: 120 }

//calculamos ancho y alto en base al total menos los margenes
ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// II. Variables globales

// de nuestra variable seleccionada de graf apendamos el svg y lo acomodamos al tamaño total de ancho y alto
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

// agrupamos el objeto svg y modificamos los atrubutos den alto ancho y margenes
g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

//definimos la scala lineal 
y = d3.scaleLinear()
          .range([alto, 0])

// definimos el ancho de cada barra que se acomode del 0 al maximo tamaño de ancho con un padding de .01 interno t .03 externo
x = d3.scaleBand()
      .range([0, ancho])
      .paddingInner(0.1)
      .paddingOuter(0.3)

// definimos colores los cambiamos 
color = d3.scaleOrdinal()
          // .range(['red', 'green', 'blue', 'yellow'])
          // https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
          .range(d3.schemeCategory10)

// de nuestro grupo g modificamos sus atributos x al alto y creamos la clase eje para modifarse en css
xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')

// creamos el titulo y lo acomodamos en el centro y 5pixeles en el eje y y creamos la clase titulo-grafica para 
// darle un estilo en css
titulo = g.append('text')
          .attr('x', `${ancho / 2}px`)
          .attr('y', '-5px')
          .attr('text-anchor', 'middle')
          .text('Comercio Internacional neto de Productos en Mexico')
          .attr('class', 'titulo-grafica')


// creamos nuestro dataArray vacio que contendra informacion 

dataArray = []

//creamos la variable para usarla en el <select> y seleccionar todo  el flow es la diferencia es categorico 
//entre compras y ventas en los datos
flow = 'todas'
// seleccionamos el id #flow y le ponemos nombre de selector
flowSelect = d3.select('#Flow')

//hacemos lo mismo para las metricas o valores numericos
metrica = 'TradeValue'
metricaSelect = d3.select('#metrica')

//en este caso la informacion no se desplegara ascendente o creamos una variable para despues usarla
ascendente = false


// III. render (update o dibujo)

//creamos la funcion de render data es la informacion de nuestro csv
function render(data) {
 
  //cremos la variable de barras seleccionamos todos los rectangulos y el dato del nombre sera d.Month osea año-mes
  bars = g.selectAll('rect')
            .data(data, d => d.Month) //de los datos pasame la i y el nombre del año-mes llamado Month
  
  //usamos el enter para inicializar el objeto en este caso y le metemos los rectangulos que se van a crear
  bars.enter()
      .append('rect')
      //la grafica iniciaria asi, tamaño 0 y asi poco a poco se rellenara de negro
        .style('width', '0px')
        .style('height', '0px')
        .style('y', `${y(0)}px`)
        .style('fill', '#000')
        .style('x', d => x(d.Month) + 'px')
      .merge(bars)
      //creamos una animacion en este caso escoji otra 
        .transition()
        // https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe
        .ease(d3.easeBounce)
        //duracion en milisegudos
        .duration(2000)
        //ahora si como quedara la informacion al final, x tendra la informacion categorica, y la numerica
          .style('x', d => x(d.Month) + 'px')
          .style('y', d => (y(d[metrica])) + 'px')
          // tamaño y ancho de la barrita y aqui era donde sucedia la magia para ponerla derecha
          .style('height', d => (alto - y(d[metrica])) + 'px')
          // las rellenamos con colores dependiendo la categorias seleccionadas en este caso inciamos con todas
          .style('fill', d => color(d.Flow))
          .style('width', d => `${x.bandwidth()}px`)
  //terminamos y lo rellenamos con color negro como si fuesen desapareciendo ya que las borramos al final
  bars.exit()
      .transition()
      .duration(2000)
        .style('height', '0px')
        .style('y', d => `${y(0)}px`)
        .style('fill', '#000000')
      .remove()

  // de mi eje Y lo que ago es formatearlo aqui porque los datos eran cientos de miles de pesos dividi el dato
  // para que fueran millones de pesos
  yAxisCall = d3.axisLeft(y)
                .ticks(3)
                .tickFormat(d => d/1000000 + ((metrica/1000000 == 'TradeValue') ? 'Mdp.' : 'Mdp.'))
  //ponemos una animacion
  yAxisGroup.transition()
            .duration(2000)
            .call(yAxisCall)
  //ponemos una animacion para el eje x y acomodamos el texto y lo rotamos 90 grados para que quepa
  xAxisCall = d3.axisBottom(x)
  xAxisGroup.transition()
            .duration(2000)
            .call(xAxisCall)
            .selectAll('text')
            .attr('x', '-8px')
            .attr('y', '-5px')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
}

// IV. Carga de datos

//cargamops los datos
d3.csv('Comercio-internacional-neto-de-Productos-del-Reino-Vegetal--Flujo-mensual.csv')
//usamos la funcion then por si falla cacharla
.then(function(data) {
  data.forEach(d => {
    // de strings a valores numericos
    d.TradeValue = +d.TradeValue
    d.Año = +d.Año
    d.Month_id = +d.Month_id
    d.id = +d.id
    d.Carnes = +d.Carnes
  })
  //nuestro data array ya contiene datos yeii
  dataArray = data
  
  //dependiendo las categorias mapeadas van los colores
  color.domain(data.map(d => d.Flow))

  // nuestro select ya va a tener la opcion todas que definimos antes en el flowselect
  flowSelect.append('option')
              .attr('value', 'todas')
              .text('Todas')
  color.domain().forEach(d => {
    console.log(d)
    flowSelect.append('option')
                .attr('value', d)
                .text(d)
  })

  // V. Despliegue
  //llamamos a la funcion frame que creamos abajo era antiguamente el render esto para que cuando seleccionemos 
  //algo nuevo se actualice y llame a la funcion de nuevo
  frame()
})
// cachamos errores si no nos conectamos a el csv o alguna otra falla 
.catch(e => {
  console.log('No se tuvo acceso al archivo ' + e.message)
})

//creamos la funcion frame
function frame() {
  //la informacion es lo que tenga dataArray 
  dataframe = dataArray
  // si es diferente a todas entonces filtramos los datos y ahora flow sera lo que este en flow
  if (Flow != 'todas') {
    dataframe = d3.filter(dataArray, d => d.Flow == Flow)
  }

  // aqui es donde hacemos el sort a la informacion de la metrica 
  dataframe.sort((a, b) => {
    return ascendente ? d3.ascending(a[metrica], b[metrica]) : d3.descending(a[metrica], b[metrica])
    //
    // Es equivalente a...
    //
    // return ascendente ? a[metrica] - b[metrica] : b[metrica] - a[metrica]
  })

  // Calcular la altura más alta dentro de
  // los datos de compras o ventas del comercio internacional
  maxy = d3.max(dataframe, d => d[metrica])
  // Creamos una función para calcular la altura
  // de las barras y que quepan en nuestro canvas
  y.domain([0, maxy])
  x.domain(dataframe.map(d => d.Month))
  // aqui se hace el render de la nueva informacion
  render(dataframe)
}

// si cambia algun select el flow ahora tendra otro valor
flowSelect.on('change', () => {
  Flow = flowSelect.node().value
  frame()
})
// si la metrica cambia de valor ahora tendra otro valor
metricaSelect.on('change', () => {
  metrica = metricaSelect.node().value
  frame()
})

// cambiamos de ascendente o descendete con el boton
function cambiaOrden() {
  ascendente = !ascendente
  frame()
}