function StatCard({
    title,
    value,
    icon,
    description,
    trend,
    trendType = "positive",
  }) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
  
        <div className="flex items-start justify-between">
  
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
  
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </h3>
          </div>
  
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            {icon}
          </div>
  
        </div>
  
        <div className="mt-4 flex items-center gap-2">
  
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trendType === "positive"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend}
            </span>
          )}
  
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
  
        </div>
      </div>
    );
  }
  
  export default StatCard;