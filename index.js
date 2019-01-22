const url = 'https://gist.githubusercontent.com/yipdw/58559104bb8a15498bb052602197bc17/raw/b3373c935aa08fa70f562568709c967e3b2d99fb/data.json';

d3.json(url).then (function (data) {
  const vis = document.getElementById('vis');
  const html = document.getElementsByTagName('html')[0];

  const margin = {
    top: 20,
    left: 20,
    bottom: 40,
    right: 20
  };

  const width = vis.scrollWidth - margin.right;
  const height = vis.scrollHeight - margin.bottom;

  const svg = d3.select(vis)
                .append('svg')
                  .attr('width', width) 
                  .attr('height', height)
                .append('g')
                  .attr('x', margin.left)
                  .attr('y', margin.top);

  const minT = _.minBy(data, 'ts').ts;
  const maxT = _.maxBy(data, 'ts').ts;

  const tasks = _.uniq(_.map(data, (o) => { return o.task; }));
  const roots = _.filter(data, (o) => { return o.parent === 'null'; });
  const subtasks = _.groupBy(_.filter(data, (o) => { return o.parent !== 'null'; }), 'parent');

  const x = d3.scaleLinear()
              .domain([minT, maxT])
              .range([0, width]);
  const xAxis = d3.axisBottom(x);
  const colorTopLevel = d3.scaleOrdinal().domain(roots).range(d3.schemePastel1);
  const color = d3.scaleOrdinal().domain(tasks).range(d3.schemeCategory10);
  const blockHeight = 32;

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', "translate(0, " + (height - margin.bottom) + ")")
      .call(xAxis);

  function drawSubTasks(svg, parentName, y, color) {
    const ts = subtasks[parentName];

    if (!ts || ts.length === 0) {
      return;
    }

    _.each(ts, function (o) {
      drawTask(svg, o, y, color);
      drawSubTasks(svg, o.task, y + blockHeight, color);
    });
  }

  function drawTask(svg, o, y, color) {
    svg.append('rect')
      .attr('width', x(o.length))
      .attr('x', x(o.ts))
      .attr('y', y)
      .attr('class', 'task')
      .attr('height', blockHeight)
      .attr('p-task', o.task)
      .attr('p-length', o.length)
      .attr('fill', color(o.task));
  }

  _.each(roots, function (o) {
    drawTask(svg, o, 0, colorTopLevel);
    drawSubTasks(svg, o.task, blockHeight, color);
  });

  const tooltip = document.getElementById('tooltip');
  const task = tooltip.getElementsByClassName('task')[0];
  const length = tooltip.getElementsByClassName('length')[0];
  const hide = () => { tooltip.classList.remove('active'); }

  svg.selectAll('.task')
    .on('mouseenter', function () {
      const el = d3.select(this);
      el.classed('selected', true);

      task.innerHTML = el.attr('p-task');
      length.innerHTML = _.round(el.attr('p-length'), 3) + ' ms';
      tooltip.classList.add('active');

      tooltip.style.left = el.attr('x') + 'px';
      tooltip.style.top = (parseInt(el.attr('y'), 10) + blockHeight) + 'px';
    })
    .on('mouseleave', function () {
      const el = d3.select(this);
      el.classed('selected', false);
    });

  d3.select(tooltip).on('click', hide);
});
