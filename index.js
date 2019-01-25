const url = 'data.json';

d3.json(url).then (function (data) {
  const vis = document.getElementById('vis');

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
  const roots = _.filter(data, (o) => { return o.parent_id === 0; });
  const subtasks = _.groupBy(_.filter(data, (o) => { return o.parent_id !== 0; }), 'parent_id');

  const x = d3.scaleLinear()
              .domain([minT, maxT])
              .range([0, width]);
  const xAxis = d3.axisBottom(x).ticks(50);
  const color = d3.scaleOrdinal().domain(tasks).range(d3.schemeCategory10);
  const blockHeight = 32;

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', "translate(0, " + (height - margin.bottom) + ")")
      .call(xAxis);

  svg.selectAll('.tick line')
    .attr('y2', height)
    .attr('transform', "translate(0, " + (-height) + ")");

  function drawSubTasks(svg, parentId, y) {
    const ts = subtasks[parentId];

    if (!ts || ts.length === 0) {
      return;
    }

    _.each(ts, function (o) {
      drawTask(svg, o, y);
      drawSubTasks(svg, o.id, y + blockHeight);
    });
  }

  function drawTask(svg, o, y) {
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
    drawTask(svg, o, 0);
    drawSubTasks(svg, o.id, blockHeight);
  });


  const tooltip = document.getElementById('tooltip');
  const task = tooltip.getElementsByClassName('task')[0];
  const length = tooltip.getElementsByClassName('length')[0];
  const body = document.getElementsByTagName('body')[0];

  svg.selectAll('.task')
    .on('mouseenter', function () {
      const el = d3.select(this);
      const p = d3.mouse(body);

      el.classed('selected', true);

      task.innerHTML = el.attr('p-task');
      length.innerHTML = _.round(el.attr('p-length'), 3) + ' ms';
      tooltip.classList.add('active');

      tooltip.style.left = p[0] + 'px';
      tooltip.style.top = (p[1] + blockHeight) + 'px';
    })
    .on('mouseleave', function () {
      const el = d3.select(this);
      el.classed('selected', false);
    });

  d3.select(tooltip).on('click', () => { tooltip.classList.remove('active'); });
});

// vim:ts=2:sw=2:et
