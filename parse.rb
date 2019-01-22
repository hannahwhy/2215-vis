require 'json'

indicator = '[PROFILE]'

class Measurement
  attr_reader :ts, :id, :thread_id, :parent_id, :task, :length

  def initialize(ts, id, thread_id, parent_id, task, length)
    @ts = ts.to_i
    @id = id.to_i
    @thread_id = thread_id
    @parent_id = parent_id.to_i
    @task = task
    @length = length.to_i
  end
end

args = File.read(ARGV[0]).split("\n").select { |l| l.start_with?(indicator) }.map { |l| l[indicator.length..-1].split(':').map(&:strip) }
measurements = args.map { |a| Measurement.new(*a) }.sort_by(&:ts)
min_ts = measurements.min_by(&:ts).ts

def ms(v)
  v.to_f / 1000000
end

objs = measurements.map do |m|
  { ts_abs: ms(m.ts),
    ts: ms(m.ts - min_ts),
    thread_id: m.thread_id,
    parent_id: m.parent_id,
    id: m.id,
    task: m.task,
    length: ms(m.length)
  }
end

puts objs.to_json
