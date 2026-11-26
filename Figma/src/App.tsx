import { FormEvent, useMemo, useState } from 'react'

type IconName =
  | 'sun'
  | 'calendar'
  | 'star'
  | 'check'
  | 'inbox'
  | 'search'
  | 'plus'
  | 'more'
  | 'chevron'
  | 'close'
  | 'note'
  | 'repeat'
  | 'attachment'
  | 'trash'
  | 'menu'
  | 'users'
  | 'list'
  | 'arrow'
  | 'flag'
  | 'alarm'

const paths: Record<IconName, React.ReactNode> = {
  sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  star: <path d="m12 3 2.7 5.47 6.04.88-4.37 4.26 1.03 6.02L12 16.8l-5.4 2.83 1.03-6.02-4.37-4.26 6.04-.88L12 3Z"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  inbox: <><path d="M4 5h16v14H4z"/><path d="M4 14h4l2 2h4l2-2h4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  note: <><path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h6"/></>,
  repeat: <><path d="m17 2 3 3-3 3"/><path d="M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3"/><path d="M21 13v2a4 4 0 0 1-4 4H4"/></>,
  attachment: <path d="m20.5 11.5-8.3 8.3a5 5 0 0 1-7.1-7.1l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-2.8-2.8l8.3-8.3"/>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/><path d="M10 11v6M14 11v6"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  list: <path d="M4 6h16M4 12h16M4 18h16"/>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  flag: <><path d="M5 21V4"/><path d="M5 5h11l-2 4 2 4H5"/></>,
  alarm: <><circle cx="12" cy="13" r="7"/><path d="M12 10v4l2.5 1.5M5 3 2 6M19 3l3 3M6.5 20l-1.5 2M17.5 20l1.5 2"/></>,
}

function Icon({ name, size = 19, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

type Task = {
  id: number
  title: string
  list: string
  due?: string
  dueTone?: 'red' | 'blue'
  completed: boolean
  important: boolean
  note?: string
  steps?: { label: string; done: boolean }[]
  myDay?: boolean
}

const seedTasks: Task[] = [
  { id: 1, title: 'Prepare quarterly roadmap', list: 'Work', due: 'Today', dueTone: 'red', completed: false, important: true, myDay: true, note: 'Review the research notes and align milestones with the team before Friday.', steps: [{ label: 'Review customer feedback', done: true }, { label: 'Draft key milestones', done: false }, { label: 'Share with the team', done: false }] },
  { id: 2, title: 'Book a dentist appointment', list: 'Personal', due: 'Today', dueTone: 'red', completed: false, important: false, myDay: true },
  { id: 3, title: 'Pick up dry cleaning', list: 'Personal', completed: false, important: false, myDay: true },
  { id: 4, title: 'Send project recap to Maya', list: 'Work', due: 'Tomorrow', dueTone: 'blue', completed: false, important: false, myDay: true },
  { id: 5, title: 'Water the plants', list: 'Home', completed: true, important: false, myDay: true },
  { id: 6, title: 'Order new coffee filters', list: 'Home', completed: true, important: false, myDay: true },
  { id: 7, title: 'Renew travel insurance', list: 'Personal', due: 'Fri, Nov 28', completed: false, important: true },
]

const smartViews = [
  { label: 'My Day', icon: 'sun' as IconName },
  { label: 'Important', icon: 'star' as IconName },
  { label: 'Planned', icon: 'calendar' as IconName },
  { label: 'Assigned to me', icon: 'users' as IconName },
  { label: 'Flagged email', icon: 'flag' as IconName },
  { label: 'Tasks', icon: 'inbox' as IconName },
]

function App() {
  const [tasks, setTasks] = useState(seedTasks)
  const [selectedView, setSelectedView] = useState('My Day')
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(1)
  const [newTask, setNewTask] = useState('')
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(true)
  const [newStep, setNewStep] = useState('')

  const selectedTask = tasks.find((task) => task.id === selectedTaskId)
  const filtered = useMemo(() => {
    let items = tasks
    if (selectedView === 'My Day') items = items.filter((task) => task.myDay)
    else if (selectedView === 'Planned') items = items.filter((task) => task.due)
    else if (selectedView === 'Important') items = items.filter((task) => task.important)
    else if (selectedView === 'Completed') items = items.filter((task) => task.completed)
    else if (!smartViews.some((view) => view.label === selectedView)) items = items.filter((task) => task.list === selectedView)
    if (query.trim()) items = items.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()))
    return items
  }, [tasks, selectedView, query])

  const activeTasks = filtered.filter((task) => !task.completed)
  const completedTasks = filtered.filter((task) => task.completed)

  function addTask(event: FormEvent) {
    event.preventDefault()
    if (!newTask.trim()) return
    const task: Task = {
      id: Date.now(),
      title: newTask.trim(),
      list: smartViews.some((view) => view.label === selectedView) ? 'Tasks' : selectedView,
      completed: false,
      important: false,
      myDay: selectedView === 'My Day',
    }
    setTasks((current) => [task, ...current])
    setSelectedTaskId(task.id)
    setNewTask('')
  }

  function updateTask(id: number, patch: Partial<Task>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)))
  }

  function chooseView(label: string) {
    setSelectedView(label)
    setSelectedTaskId(null)
    setSidebarOpen(false)
  }

  function addStep(event: FormEvent) {
    event.preventDefault()
    if (!selectedTask || !newStep.trim()) return
    updateTask(selectedTask.id, { steps: [...(selectedTask.steps ?? []), { label: newStep.trim(), done: false }] })
    setNewStep('')
  }

  return (
    <main className={`app-shell ${selectedTask ? 'detail-active' : ''}`}>
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="icon-button mobile-close sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><Icon name="close" /></button>

        <button className="profile">
          <span className="avatar">TC</span>
          <span className="profile-copy"><strong>Tony Cheng</strong><small>tony@example.com</small></span>
          <Icon name="more" size={18} />
        </button>

        <label className="search-box sidebar-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search tasks" />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search"><Icon name="close" size={15} /></button>}
          <Icon name="search" size={17} />
        </label>

        <nav className="smart-nav" aria-label="Smart views">
          {smartViews.map((view) => (
            <button key={view.label} className={`nav-item ${selectedView === view.label ? 'active' : ''}`} onClick={() => chooseView(view.label)}>
              <Icon name={view.icon} size={18} filled={view.label === 'Important' && selectedView === view.label} />
              <span>{view.label}</span>
              {view.label === 'My Day' && <small>{tasks.filter((task) => task.myDay && !task.completed).length}</small>}
              {view.label === 'Important' && <small>{tasks.filter((task) => task.important && !task.completed).length}</small>}
            </button>
          ))}
        </nav>

        <div className="nav-section">
          {['Work', 'Personal', 'Home'].map((list) => (
            <button key={list} className={`nav-item ${selectedView === list ? 'active' : ''}`} onClick={() => chooseView(list)}>
              <Icon name="list" size={17} />
              <span>{list}</span>
              <small>{tasks.filter((task) => task.list === list && !task.completed).length}</small>
            </button>
          ))}
          <button className={`nav-item ${selectedView === 'Weekend trip' ? 'active' : ''}`} onClick={() => chooseView('Weekend trip')}>
            <Icon name="list" size={17} />
            <span className="shared-list-name">
              <span>Weekend trip</span>
              <span className="shared-indicator" title="Shared list"><Icon name="users" size={15} /></span>
            </span>
            <small>{tasks.filter((task) => task.list === 'Weekend trip' && !task.completed).length}</small>
          </button>
        </div>

        <button className="new-list"><Icon name="plus" size={18} /> New list</button>
      </aside>

      {sidebarOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <section className="task-pane">
        <header className="task-header">
          <div className="mobile-title-row">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
            <span className="mobile-logo">To Do</span>
          </div>
          <div className="header-main">
            <div>
              <p className="eyebrow">Tuesday, November 25</p>
              <h1>{selectedView}</h1>
              <p className="subhead">{selectedView === 'My Day' ? 'Tuesday' : `${filtered.length} tasks`}</p>
            </div>
            <div className="header-actions">
              <button className="icon-button" aria-label="More options"><Icon name="more" /></button>
            </div>
          </div>
        </header>

        <div className="task-scroll">
          <div className="task-group">
            {activeTasks.map((task) => (
              <TaskRow key={task.id} task={task} selected={selectedTaskId === task.id} onSelect={() => setSelectedTaskId(task.id)} onUpdate={(patch) => updateTask(task.id, patch)} />
            ))}
            {!activeTasks.length && !completedTasks.length && (
              <div className="empty-state">
                <span><Icon name="sun" size={28} /></span>
                <h3>Your day is wide open</h3>
                <p>Add something you’d like to get done.</p>
              </div>
            )}
          </div>

          {!!completedTasks.length && (
            <div className="completed-group">
              <button className="completed-toggle" onClick={() => setCompletedOpen(!completedOpen)}>
                <span className={completedOpen ? 'rotated' : ''}><Icon name="chevron" size={16} /></span>
                Completed <small>{completedTasks.length}</small>
              </button>
              {completedOpen && completedTasks.map((task) => (
                <TaskRow key={task.id} task={task} selected={selectedTaskId === task.id} onSelect={() => setSelectedTaskId(task.id)} onUpdate={(patch) => updateTask(task.id, patch)} />
              ))}
            </div>
          )}
        </div>
        <form className="add-task" onSubmit={addTask}>
          <span className="add-circle"><Icon name="plus" size={21} /></span>
          <input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a task" aria-label="New task title" />
          <span className="shortcut">N</span>
        </form>
      </section>

      <aside className={`detail-pane ${selectedTask ? 'detail-open' : ''}`}>
        {selectedTask ? (
          <>
            <header className="detail-header">
              <button className="icon-button" aria-label="Close details" onClick={() => setSelectedTaskId(null)}><Icon name="close" size={19} /></button>
            </header>
            <div className="detail-content">
              <section className="primary-detail-card">
                <div className="detail-title">
                  <button className={`check-control ${selectedTask.completed ? 'checked' : ''}`} onClick={() => updateTask(selectedTask.id, { completed: !selectedTask.completed })} aria-label={selectedTask.completed ? 'Mark incomplete' : 'Mark complete'}>{selectedTask.completed && <Icon name="check" size={15} />}</button>
                  <textarea value={selectedTask.title} onChange={(event) => updateTask(selectedTask.id, { title: event.target.value })} rows={1} />
                  <button className={`star-button ${selectedTask.important ? 'important' : ''}`} onClick={() => updateTask(selectedTask.id, { important: !selectedTask.important })} aria-label="Toggle important"><Icon name="star" filled={selectedTask.important} /></button>
                </div>
                {(selectedTask.steps ?? []).map((step, index) => (
                  <label className="step-row" key={`${step.label}-${index}`}>
                    <input type="checkbox" checked={step.done} onChange={() => {
                      const steps = [...(selectedTask.steps ?? [])]
                      steps[index] = { ...step, done: !step.done }
                      updateTask(selectedTask.id, { steps })
                    }} />
                    <span>{step.label}</span>
                  </label>
                ))}
                <form className="add-step" onSubmit={addStep}>
                  <Icon name="plus" size={17} />
                  <input value={newStep} onChange={(event) => setNewStep(event.target.value)} placeholder="Add a step" />
                </form>
              </section>

              <button className={`detail-action ${selectedTask.myDay ? 'active' : ''}`} onClick={() => updateTask(selectedTask.id, { myDay: !selectedTask.myDay })}>
                <Icon name="sun" size={21} /><span>{selectedTask.myDay ? 'Added to My Day' : 'Add to My Day'}</span>
              </button>

              <div className="detail-actions-card schedule-card">
                <button><Icon name="alarm" size={21} /><span>Remind me</span></button>
                <button className="has-value"><Icon name="calendar" size={20} /><span>{selectedTask.due ? `Due ${selectedTask.due}` : 'Add due date'}</span>{selectedTask.due && <Icon name="close" size={18} />}</button>
                <button className="has-value"><Icon name="repeat" size={20} /><span>Daily</span><Icon name="close" size={18} /></button>
              </div>

              <div className="detail-action assignee-card">
                <span className="assignee-avatar">NC</span>
                <span>Nioh Cheng</span>
                <button aria-label="Remove assignee"><Icon name="close" size={18} /></button>
              </div>

              <button className="detail-action file-card"><Icon name="attachment" size={21} /><span>Add file</span></button>

              <label className="notes-card">
                <textarea value={selectedTask.note ?? ''} onChange={(event) => updateTask(selectedTask.id, { note: event.target.value })} placeholder="Add note" rows={4} />
              </label>
            </div>
            <footer className="detail-footer">
              <small>Created by Nioh Cheng on Tue, Nov 25</small>
              <button aria-label="Delete task" onClick={() => { setTasks((current) => current.filter((task) => task.id !== selectedTask.id)); setSelectedTaskId(null) }}><Icon name="trash" size={18} /></button>
            </footer>
          </>
        ) : (
          <div className="detail-placeholder">
            <span><Icon name="arrow" size={23} /></span>
            <h3>Select a task</h3>
            <p>Choose a task to see its details.</p>
          </div>
        )}
      </aside>

      <nav className="mobile-bottom">
        <button className={selectedView === 'My Day' ? 'active' : ''} onClick={() => chooseView('My Day')}><Icon name="sun" /><span>My Day</span></button>
        <button className={selectedView === 'Tasks' ? 'active' : ''} onClick={() => chooseView('Tasks')}><Icon name="inbox" /><span>Tasks</span></button>
        <button onClick={() => setSidebarOpen(true)}><Icon name="search" /><span>Search</span></button>
        <button onClick={() => document.querySelector<HTMLInputElement>('.add-task input')?.focus()}><Icon name="plus" /><span>New task</span></button>
      </nav>
    </main>
  )
}

function TaskRow({ task, selected, onSelect, onUpdate }: { task: Task; selected: boolean; onSelect: () => void; onUpdate: (patch: Partial<Task>) => void }) {
  return (
    <article className={`task-row ${selected ? 'selected' : ''} ${task.completed ? 'completed' : ''}`} onClick={onSelect}>
      <button className={`check-control ${task.completed ? 'checked' : ''}`} onClick={(event) => { event.stopPropagation(); onUpdate({ completed: !task.completed }) }} aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>
        {task.completed && <Icon name="check" size={14} />}
      </button>
      <div className="task-copy">
        <strong>{task.title}</strong>
        <div className="task-meta">
          <span>{task.list}</span>
          {task.due && <><i>•</i><span className={task.dueTone === 'red' ? 'due-red' : ''}><Icon name="calendar" size={12} />{task.due}</span></>}
          {!!task.steps?.length && <><i>•</i><span>{task.steps.filter((step) => step.done).length} of {task.steps.length}</span></>}
        </div>
      </div>
      <span className="row-assignee" title="Assigned to Nioh Cheng" aria-label="Assigned to Nioh Cheng">NC</span>
      <button className={`star-button ${task.important ? 'important' : ''}`} onClick={(event) => { event.stopPropagation(); onUpdate({ important: !task.important }) }} aria-label="Toggle important"><Icon name="star" size={18} filled={task.important} /></button>
    </article>
  )
}

export default App
