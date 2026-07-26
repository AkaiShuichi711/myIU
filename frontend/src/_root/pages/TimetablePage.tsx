import { useMemo } from 'react';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { useGetTimetable } from '@/lib/react-query/queriesAndMutations';

const DAYS = [
  { key: 'MON', label: 'Thứ 2' },
  { key: 'TUE', label: 'Thứ 3' },
  { key: 'WED', label: 'Thứ 4' },
  { key: 'THU', label: 'Thứ 5' },
  { key: 'FRI', label: 'Thứ 6' },
  { key: 'SAT', label: 'Thứ 7' },
] as const;

const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_PX = 64;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

const DAY_JS_MAP: Record<number, string> = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT', 0: 'SUN' };
const todayKey = DAY_JS_MAP[new Date().getDay()];

function timeToPx(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - START_HOUR) * HOUR_PX + (m / 60) * HOUR_PX;
}

function hexToRgb(hex: string): string {
  const c = (hex || '#0057A8').replace('#', '').padEnd(6, '0');
  return `${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)}`;
}

type Entry = {
  scheduleId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  coverColor: string;
  semester: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
};

export default function TimetablePage() {
  const { data: rawEntries = [], isPending } = useGetTimetable();
  const entries = rawEntries as Entry[];

  const byDay = useMemo(() => {
    const map: Record<string, Entry[]> = {};
    for (const d of DAYS) map[d.key] = [];
    for (const e of entries) {
      if (map[e.dayOfWeek]) map[e.dayOfWeek].push(e);
    }
    return map;
  }, [entries]);

  const hasAny = entries.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6F8] dark:bg-[#19191a]">

      {/* Header */}
      <div className="bg-white dark:bg-[#1e2028] border-b border-[#E0E4EB] dark:border-[#33485c]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Calendar size={18} className="text-[#0057A8]" />
          <div>
            <h1 className="text-[17px] font-bold text-slate-900 dark:text-[#e8edf0]">Thời khóa biểu</h1>
            <p className="text-[12px] text-slate-400 dark:text-[#4d6070] mt-0.5">
              Lịch học theo tuần — học kỳ hiện tại
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">

        {isPending && (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#0057A8]" />
          </div>
        )}

        {!isPending && !hasAny && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Calendar size={40} className="text-slate-200 dark:text-[#33485c]" />
            <p className="text-sm font-medium text-slate-400">Chưa có lịch học nào</p>
            <p className="text-xs text-slate-300 dark:text-[#33485c] text-center max-w-xs">
              Giảng viên có thể thêm lịch học trong trang chi tiết Khóa học
            </p>
          </div>
        )}

        {!isPending && hasAny && (
          <>
            {/* ── Desktop grid ─────────────────────────────────────────── */}
            <div className="hidden md:block bg-white dark:bg-[#1e2028] rounded-2xl border border-[#E0E4EB] dark:border-[#33485c] overflow-hidden">

              {/* Day header row */}
              <div
                className="grid border-b border-[#E0E4EB] dark:border-[#33485c]"
                style={{ gridTemplateColumns: '48px repeat(6, 1fr)' }}
              >
                <div />
                {DAYS.map(d => (
                  <div
                    key={d.key}
                    className={`h-11 flex flex-col items-center justify-center text-[11.5px] font-bold border-l border-[#E0E4EB] dark:border-[#33485c] ${
                      d.key === todayKey
                        ? 'text-[#0057A8] bg-[#0057A8]/5'
                        : 'text-slate-500 dark:text-[#4d6070]'
                    }`}
                  >
                    {d.label}
                    {d.key === todayKey && (
                      <span className="w-1 h-1 rounded-full bg-[#0057A8] mt-0.5" />
                    )}
                  </div>
                ))}
              </div>

              {/* Time + slot grid */}
              <div
                className="grid"
                style={{ gridTemplateColumns: '48px repeat(6, 1fr)' }}
              >
                {/* Time axis */}
                <div className="relative" style={{ height: `${HOURS.length * HOUR_PX}px` }}>
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="absolute right-2 text-[9.5px] text-slate-300 dark:text-[#33485c] font-mono"
                      style={{ top: `${(h - START_HOUR) * HOUR_PX - 7}px` }}
                    >
                      {`${h}:00`}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map(d => (
                  <div
                    key={d.key}
                    className={`relative border-l border-[#E0E4EB] dark:border-[#33485c] ${
                      d.key === todayKey ? 'bg-[#0057A8]/[0.015]' : ''
                    }`}
                    style={{ height: `${HOURS.length * HOUR_PX}px` }}
                  >
                    {/* Hour lines */}
                    {HOURS.map(h => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-[#F0F2F5] dark:border-[#243447]"
                        style={{ top: `${(h - START_HOUR) * HOUR_PX}px` }}
                      />
                    ))}

                    {/* Entries */}
                    {byDay[d.key].map(e => {
                      const top    = timeToPx(e.startTime);
                      const height = timeToPx(e.endTime) - top;
                      const color  = e.coverColor || '#0057A8';
                      const rgb    = hexToRgb(color);
                      const isTall     = height >= 56;
                      const isVeryTall = height >= 90;
                      return (
                        <div
                          key={e.scheduleId}
                          className="absolute left-1 right-1 rounded-lg px-2 py-1 overflow-hidden select-none"
                          style={{
                            top:    `${top + 2}px`,
                            height: `${height - 4}px`,
                            background: `rgba(${rgb},0.11)`,
                            borderLeft: `3px solid ${color}`,
                          }}
                          title={`${e.courseName}${e.room ? ' · ' + e.room : ''} (${e.startTime}–${e.endTime})`}
                        >
                          <p
                            className="text-[10px] font-black leading-tight truncate"
                            style={{ color }}
                          >
                            {e.courseCode}
                          </p>
                          {isTall && (
                            <p className="text-[9.5px] text-slate-600 dark:text-[#99a3ad] leading-tight mt-0.5 line-clamp-2">
                              {e.courseName}
                            </p>
                          )}
                          {isVeryTall && e.room && (
                            <p className="flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-[#4d6070] mt-0.5">
                              <MapPin size={8} /> {e.room}
                            </p>
                          )}
                          {isTall && (
                            <p className="text-[9px] text-slate-400 dark:text-[#4d6070] mt-0.5">
                              {e.startTime}–{e.endTime}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Mobile list ──────────────────────────────────────────── */}
            <div className="md:hidden flex flex-col gap-3">
              {DAYS.filter(d => byDay[d.key].length > 0).map(d => (
                <div
                  key={d.key}
                  className="bg-white dark:bg-[#1e2028] rounded-2xl border border-[#E0E4EB] dark:border-[#33485c] overflow-hidden"
                >
                  <div
                    className={`px-4 py-2.5 border-b border-[#E0E4EB] dark:border-[#33485c] flex items-center gap-2 ${
                      d.key === todayKey ? 'bg-[#0057A8]/5' : ''
                    }`}
                  >
                    <span className={`text-[12.5px] font-bold ${d.key === todayKey ? 'text-[#0057A8]' : 'text-slate-600 dark:text-[#99a3ad]'}`}>
                      {d.label}
                    </span>
                    {d.key === todayKey && (
                      <span className="text-[10px] text-[#0057A8] font-semibold">Hôm nay</span>
                    )}
                  </div>
                  <div className="divide-y divide-[#F4F6F8] dark:divide-[#243447]">
                    {[...byDay[d.key]]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(e => {
                        const color = e.coverColor || '#0057A8';
                        return (
                          <div key={e.scheduleId} className="flex items-center gap-3 px-4 py-3">
                            <div
                              className="w-1 self-stretch rounded-full shrink-0"
                              style={{ background: color }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[12.5px] font-semibold text-slate-700 dark:text-[#bfc6cc] truncate">
                                {e.courseName}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-[#4d6070] mt-0.5">
                                {e.startTime}–{e.endTime}{e.room ? ` · ${e.room}` : ''}
                              </p>
                            </div>
                            <span
                              className="text-[10px] font-black px-2 py-0.5 rounded-md shrink-0"
                              style={{ background: `${color}18`, color }}
                            >
                              {e.courseCode}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
