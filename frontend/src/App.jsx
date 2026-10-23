import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { apiRequest, clearSession, getSessionUser, saveSession } from "./services/api";
import "./App.css";

const navItems = [
  ["Dashboard", "/", "⌂"],
  ["Projects", "/projects", "▦"],
  ["Notes", "/notes", "▤"],
  ["Files", "/files", "↥"],
  ["Team", "/team", "♧"],
  ["AI Studio", "/ai", "✳"],
  ["Profile", "/profile", "◉"],
];

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(getSessionUser());
  const activeItem = navItems.find(([, path]) => path === location.pathname);
  const title = activeItem?.[0] || "Dashboard";

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <Link to="/" className="brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark">C</span>
          <span>Collab<span className="brand-light">Sphere</span><small>DEVELOPER WORKSPACE</small></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(([label, path, icon]) => (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)} className={`nav-link ${location.pathname === path ? "nav-active" : ""}`}>
              <span className="nav-icon">{icon}</span><span>{label}</span>
              {location.pathname === path && <span className="nav-indicator" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help"><span className="help-icon">?</span><div><strong>Need a hand?</strong><small>Keep building great things.</small></div></div>
          <button className="logout-link" onClick={logout}><span>↪</span> Sign out</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">☰</button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{title}</strong></div>
          <div className="topbar-right"><span className="status-dot" /> <span className="online-label">Workspace active</span><div className="top-avatar">{(user?.name || "D").charAt(0).toUpperCase()}</div><div className="top-user"><strong>{user?.name || "Developer"}</strong><small>{user?.email || "Your workspace"}</small></div></div>
        </header>
        <div className="page-wrap">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/files" element={<Files />} />
            <Route path="/team" element={<Team />} />
            <Route path="/ai" element={<AIStudio />} />
            <Route path="/profile" element={<Profile user={user} onUserChange={setUser} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <footer className="app-footer"><span>© {new Date().getFullYear()} CollabSphere</span><span>Built for teams who build.</span></footer>
      </main>
    </div>
  );
}

function ProtectedApp() {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  return token ? <AppShell /> : <Navigate to="/login" replace />;
}

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const data = await apiRequest(isRegister ? "/auth/register" : "/auth/login", { method: "POST", body: JSON.stringify(form) });
      if (isRegister) {
        navigate("/login", { state: { notice: data.message || "Account created. Please sign in." } });
      } else {
        const token = data.Token || data.token || data.accessToken;
        if (!token) throw new Error("The backend did not return an authentication token.");
        let sessionUser = { name: form.name || data.user?.name || "", email: form.email };
        saveSession(token, sessionUser);
        try {
          const profile = await apiRequest("/auth/profile");
          if (profile.user) sessionUser = profile.user;
        } catch { /* Login succeeded; keep the basic session details. */ }
        saveSession(token, sessionUser);
        navigate("/", { replace: true });
      }
    } catch (err) { setError(err.message || "Request failed. Check that the backend is running."); }
    finally { setBusy(false); }
  };
  const location = useLocation();
  return <div className="auth-layout">
    <section className="auth-promo">
      <Link to="/login" className="brand auth-brand"><span className="brand-mark">C</span><span>Collab<span className="brand-light">Sphere</span><small>DEVELOPER WORKSPACE</small></span></Link>
      <div className="promo-content"><span className="eyebrow"><span className="status-dot" /> BUILT FOR BETTER COLLABORATION</span><h1>One space.<br/><em>Better builds.</em></h1><p>Bring your projects, notes, shared files, and AI-powered workflows together in one focused workspace.</p><div className="promo-points"><div><span>✓</span> Projects and people, connected</div><div><span>✓</span> Documentation that stays close to code</div><div><span>✓</span> AI tools for your everyday workflow</div></div></div>
      <div className="promo-foot">Plan together. Build together. Ship together.</div>
    </section>
    <section className="auth-main"><div className="auth-card"><div className="auth-mobile-brand"><span className="brand-mark">C</span> CollabSphere</div><span className="eyebrow">YOUR WORKSPACE AWAITS</span><h2>{isRegister ? "Create your account" : "Welcome back"}</h2><p className="auth-subtitle">{isRegister ? "Start bringing your team's work together." : "Sign in to pick up where your team left off."}</p>
      {!isRegister && location.state?.notice && <div className="notice">{location.state.notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit} className="form-stack">
        {isRegister && <label>Full name<input autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Aditi Pusnake" required minLength={2}/></label>}
        <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label>
        <label>Password<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={isRegister ? "Create a password" : "Enter your password"} required minLength={isRegister ? 8 : 1}/></label>
        <button className="btn btn-primary btn-full" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account  →" : "Sign in  →"}</button>
      </form>
      <div className="auth-switch">{isRegister ? "Already have an account?" : "New to CollabSphere?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></div>
      <div className="auth-security">🔒 Your workspace is protected by secure sign-in.</div>
    </div></section>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Notice({ error, message }) {
  if (!error && !message) return null;
  return <div className={`alert ${error ? "alert-error" : "alert-success"}`}>{error || message}</div>;
}
function Loading({ label = "Loading workspace…" }) { return <div className="loading-state"><span className="spinner" />{label}</div>; }
function Empty({ icon = "◇", title, description, action }) { return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>; }
function formatDate(value) { if (!value) return "Recently"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); }
function initials(value) { return (value || "U").split(/\s+/).map(v=>v[0]).join("").slice(0,2).toUpperCase(); }

function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await apiRequest("/projects"); setProjects(Array.isArray(data.projects) ? data.projects : Array.isArray(data) ? data : []); }
    catch (err) { setError(err.message || "Unable to load projects."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { projects, loading, error, setError, refresh };
}

function Dashboard() {
  const { projects, loading, error, refresh } = useProjects();
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState([]);
  const [noteCount, setNoteCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.all(projects.slice(0,5).map(async p => {
        try { const d = await apiRequest(`/projects/${p._id}/notes`); return (d.notes || []).map(n=>({...n, projectTitle:p.title})); } catch { return []; }
      }));
      if (!cancelled) { const notes=results.flat().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); setRecentNotes(notes.slice(0,4)); setNoteCount(notes.length); }
    }
    if (projects.length) load(); else { setRecentNotes([]); setNoteCount(0); }
    return () => { cancelled = true; };
  }, [projects]);
  const totalMembers = projects.reduce((sum,p)=>sum+(p.members?.length || 1),0);
  return <><PageHeading eyebrow="OVERVIEW" title="Good things happen together." description="Your projects, ideas, and team activity — all in one place." action={<button className="btn btn-primary" onClick={()=>navigate("/projects")}>＋ New project</button>}/>
    <div className="welcome-banner"><div><span className="banner-kicker">YOUR TEAM'S HOME BASE</span><h2>Make room for your next big idea.</h2><p>Keep your work organized and your team moving forward.</p><button className="btn btn-light" onClick={()=>navigate("/projects")}>Explore projects <span>→</span></button></div><div className="banner-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-core">C</div><div className="art-chip chip-one">{"</>"}</div><div className="art-chip chip-two">✦</div><div className="art-chip chip-three">✓</div></div></div>
    <Notice error={error}/>
    <div className="stats-grid"><Stat icon="▦" label="Projects" value={loading?"—":projects.length} tone="mint" hint="Your active workspace"/><Stat icon="▤" label="Notes found" value={loading?"—":noteCount} tone="lilac" hint="Across your projects"/><Stat icon="♧" label="Member seats" value={loading?"—":totalMembers} tone="peach" hint="Project memberships"/><Stat icon="✳" label="AI toolkit" value="3" tone="blue" hint="Ways to work smarter"/></div>
    <div className="section-row"><div><h2>Recent projects</h2><p>Pick up where you left off.</p></div><button className="text-button" onClick={()=>navigate("/projects")}>View all projects <span>→</span></button></div>
    {loading ? <Loading/> : projects.length ? <div className="project-grid">{projects.slice(0,3).map((p,i)=><ProjectTile key={p._id} project={p} index={i} onOpen={()=>navigate("/projects")}/>)}</div> : <Empty icon="▦" title="Your first project starts here" description="Create a project to bring notes, files, and collaborators together." action={<button className="btn btn-primary" onClick={()=>navigate("/projects")}>Create a project</button>}/>}
    <div className="section-row recent-heading"><div><h2>Recent notes</h2><p>Thoughts and documentation from your projects.</p></div><button className="text-button" onClick={()=>navigate("/notes")}>Browse notes <span>→</span></button></div>
    {recentNotes.length ? <div className="recent-list">{recentNotes.map(note=><div className="recent-note" key={note._id}><div className="note-symbol">▤</div><div className="recent-note-main"><strong>{note.title}</strong><span>{note.projectTitle || "Project note"}</span></div><time>{formatDate(note.updatedAt || note.createdAt)}</time></div>)}</div> : <div className="soft-empty">Your recent notes will appear here once you add notes to a project.</div>}
    <button className="btn btn-ghost refresh-button" onClick={refresh}>↻ Refresh overview</button>
  </>;
}
function Stat({icon,label,value,tone,hint}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>; }
function ProjectTile({project,index,onOpen}) { const tones=["mint","lilac","peach"]; return <article className="project-tile"><div className="tile-top"><div className={`project-symbol ${tones[index%tones.length]}`}>{project.title?.slice(0,1).toUpperCase() || "P"}</div><span className="tiny-status"><i/> Workspace</span></div><h3>{project.title || "Untitled project"}</h3><p>{project.description || "A shared space for ideas, planning, and building."}</p><div className="tile-meta"><span>♧ {project.members?.length || 1} member{(project.members?.length || 1)===1?"":"s"}</span><span>{formatDate(project.updatedAt || project.createdAt)}</span></div><button className="tile-open" onClick={onOpen}>Open project <span>→</span></button></article>; }

function Projects() {
  const {projects,loading,error,setError,refresh}=useProjects();
  const [showForm,setShowForm]=useState(false);
  const [title,setTitle]=useState(""); const [description,setDescription]=useState("");
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const [editing,setEditing]=useState(null); const [editTitle,setEditTitle]=useState(""); const [editDescription,setEditDescription]=useState("");
  const [memberProject,setMemberProject]=useState(null); const [memberEmail,setMemberEmail]=useState("");
  async function create(e) { e.preventDefault(); setBusy(true); setError(""); setMessage(""); try { await apiRequest("/projects",{method:"POST",body:JSON.stringify({title:title.trim(),description:description.trim()})}); setTitle("");setDescription("");setShowForm(false);setMessage("Project created successfully.");await refresh(); } catch(err){setError(err.message);} finally{setBusy(false);} }
  async function remove(p) { if(!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return; setError("");setMessage("");try{await apiRequest(`/projects/${p._id}`,{method:"DELETE"});setMessage("Project deleted.");await refresh();}catch(err){setError(err.message);} }
  async function saveEdit(e) { e.preventDefault(); setBusy(true);setError("");try{await apiRequest(`/projects/${editing._id}`,{method:"PUT",body:JSON.stringify({title:editTitle,description:editDescription})});setEditing(null);setMessage("Project updated.");await refresh();}catch(err){setError(err.message);}finally{setBusy(false);} }
  async function addMember(e) { e.preventDefault();setBusy(true);setError("");try{await apiRequest(`/projects/${memberProject._id}/members`,{method:"POST",body:JSON.stringify({email:memberEmail.trim()})});setMessage("Collaborator added successfully.");setMemberProject(null);setMemberEmail("");await refresh();}catch(err){setError(err.message);}finally{setBusy(false);} }
  return <><PageHeading eyebrow="YOUR WORK" title="Projects" description="Plan, organize, and build your ideas with your team." action={<button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>{showForm?"× Close":"＋ New project"}</button>}/>
    <Notice error={error} message={message}/>
    {showForm && <section className="panel form-panel"><div className="panel-heading"><div><h2>Create a project</h2><p>Give your workspace a clear name and purpose.</p></div></div><form className="form-grid" onSubmit={create}><label>Project name<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Developer Portfolio" required maxLength={100}/></label><label className="full-field">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What are you and your team building?" rows={3}/></label><div className="form-actions full-field"><button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy?"Creating…":"Create project"}</button></div></form></section>}
    {editing && <Modal title="Edit project" onClose={()=>setEditing(null)}><form className="form-stack" onSubmit={saveEdit}><label>Project name<input value={editTitle} onChange={e=>setEditTitle(e.target.value)} required/></label><label>Description<textarea value={editDescription} onChange={e=>setEditDescription(e.target.value)} rows={4}/></label><button className="btn btn-primary" disabled={busy}>{busy?"Saving…":"Save changes"}</button></form></Modal>}
    {memberProject && <Modal title={`Invite to ${memberProject.title}`} onClose={()=>setMemberProject(null)}><p className="modal-description">Collaborators must have a registered CollabSphere account.</p><form className="form-stack" onSubmit={addMember}><label>Collaborator email<input type="email" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} placeholder="teammate@example.com" required/></label><button className="btn btn-primary" disabled={busy}>{busy?"Adding…":"Add collaborator"}</button></form></Modal>}
    <div className="content-toolbar"><div><strong>{projects.length} project{projects.length===1?"":"s"}</strong><span> · Sorted by recently updated</span></div><button className="btn btn-ghost btn-small" onClick={refresh}>↻ Refresh</button></div>
    {loading?<Loading label="Loading projects…"/>:projects.length?<div className="project-grid project-grid-wide">{projects.map((p,i)=><article className="project-tile" key={p._id}><div className="tile-top"><div className={`project-symbol ${["mint","lilac","peach"][i%3]}`}>{p.title?.slice(0,1).toUpperCase()||"P"}</div><button className="icon-button" title="Edit project" onClick={()=>{setEditing(p);setEditTitle(p.title||"");setEditDescription(p.description||"");}}>···</button></div><h3>{p.title}</h3><p>{p.description||"A shared space for ideas, planning, and building."}</p><div className="tile-meta"><span>♧ {p.members?.length||1} member{(p.members?.length||1)===1?"":"s"}</span><span>{formatDate(p.createdAt)}</span></div><div className="tile-actions"><button className="btn btn-secondary btn-small" onClick={()=>{setMemberProject(p);setMemberEmail("");}}>＋ Invite</button><button className="btn btn-ghost btn-small" onClick={()=>{setEditing(p);setEditTitle(p.title||"");setEditDescription(p.description||"");}}>Edit</button><button className="btn btn-danger-ghost btn-small" onClick={()=>remove(p)}>Delete</button></div></article>)}</div>:<Empty icon="▦" title="No projects yet" description="Create your first project and invite teammates to collaborate." action={<button className="btn btn-primary" onClick={()=>setShowForm(true)}>＋ Create your first project</button>}/>}
  </>;
}
function Modal({title,onClose,children}) { return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>{children}</section></div>; }

function Notes() {
  const {projects,loading:projectsLoading,error:projectsError}=useProjects();
  const [projectId,setProjectId]=useState(""); const [notes,setNotes]=useState([]);const [loading,setLoading]=useState(false);
  const [title,setTitle]=useState("");const [content,setContent]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
  useEffect(()=>{if(!projectId&&projects.length)setProjectId(projects[0]._id);},[projects,projectId]);
  const selected=projects.find(p=>p._id===projectId);
  const loadNotes=useCallback(async(id)=>{if(!id){setNotes([]);return;}setLoading(true);setError("");try{const data=await apiRequest(`/projects/${id}/notes`);setNotes(data.notes||[]);}catch(err){setError(err.message);}finally{setLoading(false);}},[]);
  useEffect(()=>{loadNotes(projectId);},[projectId,loadNotes]);
  async function create(e){e.preventDefault();setBusy(true);setError("");setMessage("");try{const d=await apiRequest(`/projects/${projectId}/notes`,{method:"POST",body:JSON.stringify({title:title.trim(),content})});setNotes(old=>[d.note,...old]);setTitle("");setContent("");setMessage("Note saved.");}catch(err){setError(err.message);}finally{setBusy(false);}}
  async function remove(note){if(!window.confirm(`Delete note "${note.title}"?`))return;setError("");try{await apiRequest(`/notes/${note._id}`,{method:"DELETE"});await loadNotes(projectId);setMessage("Note deleted.");}catch(err){setError(err.message);}}
  return <><PageHeading eyebrow="KNOWLEDGE BASE" title="Notes & documentation" description="Capture decisions, document ideas, and keep context close to your projects." action={projects.length>0?<span className="count-pill">{notes.length} notes</span>:null}/><Notice error={error||projectsError} message={message}/>
    {projectsLoading?<Loading/>:projects.length===0?<Empty icon="▦" title="Create a project first" description="Notes belong to a project. Create one to start documenting your work."/>:<><div className="project-picker"><label htmlFor="notes-project">Project workspace</label><select id="notes-project" value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option key={p._id} value={p._id}>{p.title}</option>)}</select><span className="picker-hint">{selected?.description||"Notes shared within this project."}</span></div><div className="notes-layout"><section className="panel note-create"><div className="panel-heading"><div><span className="eyebrow">QUICK CAPTURE</span><h2>Write a note</h2><p>Save an idea, decision, or useful snippet.</p></div><span className="panel-icon">＋</span></div><form className="form-stack" onSubmit={create}><label>Note title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. API design decisions" required/></label><label>Content<textarea value={content} onChange={e=>setContent(e.target.value)} rows={7} placeholder="Write your notes here…"/></label><button className="btn btn-primary" disabled={busy||!projectId}>{busy?"Saving…":"Save note  →"}</button></form></section><section className="notes-results"><div className="section-row compact-row"><div><h2>{selected?.title||"Project"} notes</h2><p>Most recent first</p></div><button className="icon-button" onClick={()=>loadNotes(projectId)} title="Refresh notes">↻</button></div>{loading?<Loading label="Loading notes…"/>:notes.length?<div className="note-list">{notes.map(n=><article className="note-card" key={n._id}><div className="note-card-top"><span className="note-tag">NOTE</span><time>{formatDate(n.updatedAt||n.createdAt)}</time></div><h3>{n.title}</h3><p className="note-content">{n.content||"No content added."}</p><div className="note-card-bottom"><span>By {n.author?.name||"Project member"}</span><button className="text-button danger-text" onClick={()=>remove(n)}>Delete</button></div></article>)}</div>:<Empty icon="▤" title="Nothing written yet" description="Use the form to add the first note to this project."/>}</section></div></>}
  </>;
}

function Files() {
  const {projects,loading:projectsLoading,error:projectsError}=useProjects();
  const [projectId,setProjectId]=useState("");const [files,setFiles]=useState([]);const [selectedFile,setSelectedFile]=useState(null);const [loading,setLoading]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
  useEffect(()=>{if(!projectId&&projects.length)setProjectId(projects[0]._id);},[projects,projectId]);
  const loadFiles=useCallback(async(id)=>{if(!id){setFiles([]);return;}setLoading(true);setError("");try{const data=await apiRequest(`/files/${id}/files`);setFiles(data.files||[]);}catch(err){setError(err.message);}finally{setLoading(false);}},[]);
  useEffect(()=>{loadFiles(projectId);},[projectId,loadFiles]);
  async function upload(e){e.preventDefault();if(!selectedFile||!projectId)return;const allowed=["image/jpeg","image/png","application/pdf","text/plain"];if(!allowed.includes(selectedFile.type)){setError("Only JPG, PNG, PDF, and TXT files are supported by this backend.");return;}if(selectedFile.size>5*1024*1024){setError("Maximum file size is 5 MB.");return;}setBusy(true);setError("");setMessage("");try{const fd=new FormData();fd.append("file",selectedFile);const d=await apiRequest(`/files/${projectId}/files`,{method:"POST",body:fd});setMessage(d.message||"File uploaded.");setSelectedFile(null);e.target.reset();await loadFiles(projectId);}catch(err){setError(err.message);}finally{setBusy(false);}}
  async function remove(file){if(!window.confirm(`Delete "${file.originalName}"?`))return;setError("");setMessage("");try{const d=await apiRequest(`/files/${projectId}/files/${file._id}`,{method:"DELETE"});setMessage(d.message||"File deleted.");await loadFiles(projectId);}catch(err){setError(err.message);}}
  function size(n=0){return n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(2)} MB`;}
  return <><PageHeading eyebrow="SHARED RESOURCES" title="Project files" description="Upload and manage the resources your team needs." action={<span className="count-pill">{files.length} files</span>}/><Notice error={error||projectsError} message={message}/>
    {projectsLoading?<Loading/>:projects.length===0?<Empty icon="↥" title="No project to attach files to" description="Create a project before uploading shared resources."/>:<><div className="project-picker"><label htmlFor="files-project">Project workspace</label><select id="files-project" value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option key={p._id} value={p._id}>{p.title}</option>)}</select></div><section className="panel upload-panel"><div className="upload-symbol">↥</div><div className="upload-copy"><h2>Upload a resource</h2><p>JPG, PNG, PDF, or TXT · up to 5 MB per file</p></div><form onSubmit={upload} className="upload-form"><label className="file-input-label"><input type="file" accept=".jpg,.jpeg,.png,.pdf,.txt" onChange={e=>setSelectedFile(e.target.files?.[0]||null)}/><span>Choose file</span>{selectedFile?<strong>{selectedFile.name}</strong>:<small>No file selected</small>}</label><button className="btn btn-primary" disabled={busy||!selectedFile}>{busy?"Uploading…":"Upload file"}</button></form></section><div className="section-row"><div><h2>Shared files</h2><p>Resources stored with this project.</p></div><button className="btn btn-ghost btn-small" onClick={()=>loadFiles(projectId)}>↻ Refresh</button></div>{loading?<Loading label="Loading files…"/>:files.length?<div className="file-list">{files.map(f=><article className="file-row" key={f._id}><div className="file-type-icon">{(f.originalName?.split(".").pop()||"FILE").slice(0,4).toUpperCase()}</div><div className="file-main"><strong>{f.originalName}</strong><span>{size(f.size)} · Uploaded {formatDate(f.createdAt)} · {f.uploadedBy?.name||"Team member"}</span></div><a className="btn btn-ghost btn-small" href={`${(import.meta.env.VITE_API_URL||"http://localhost:5000/api").replace(/\/api\/?$/,"")}${f.fileUrl}`} target="_blank" rel="noreferrer">Open ↗</a><button className="icon-button delete-icon" title="Delete file" onClick={()=>remove(f)}>×</button></article>)}</div>:<Empty icon="↥" title="No shared files yet" description="Upload the first file to make it available to your project team."/>}</>}
  </>;
}

function Team() {
  const {projects,loading,error:projectError}=useProjects();
  const [projectId,setProjectId]=useState("");const [email,setEmail]=useState("");const [members,setMembers]=useState([]);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
  useEffect(()=>{if(!projectId&&projects.length)setProjectId(projects[0]._id);},[projects,projectId]);
  const selected=projects.find(p=>p._id===projectId);
  useEffect(()=>{let live=true;async function load(){if(!selected){setMembers([]);return;}try{const d=await apiRequest("/auth/profile");const current=d.user||{};const list=(selected.members||[]).map(m=>typeof m==="object"?m:null).filter(Boolean);if(live)setMembers(list.length?list:[{_id:current.userId||"current-user",name:current.name||"Current user",email:current.email||"Signed-in account"}]);}catch{if(live)setMembers((selected.members||[]).filter(m=>typeof m==="object"));}}load();return()=>{live=false};},[selected]);
  async function invite(e){e.preventDefault();if(!projectId)return;setBusy(true);setError("");setMessage("");try{await apiRequest(`/projects/${projectId}/members`,{method:"POST",body:JSON.stringify({email:email.trim()})});setMessage("Collaborator added to the project.");setEmail("");const d=await apiRequest("/projects");const p=(d.projects||[]).find(x=>x._id===projectId);if(p){const membersList=(p.members||[]).filter(m=>typeof m==="object");setMembers(membersList);} }catch(err){setError(err.message);}finally{setBusy(false);}}
  return <><PageHeading eyebrow="COLLABORATION" title="Team workspace" description="Bring the right people into each project and build together."/><Notice error={error||projectError} message={message}/>{loading?<Loading/>:projects.length===0?<Empty icon="♧" title="Create a project to invite your team" description="Team membership is managed at the project level."/>:<><div className="project-picker"><label htmlFor="team-project">Project workspace</label><select id="team-project" value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option key={p._id} value={p._id}>{p.title}</option>)}</select></div><div className="team-layout"><section className="panel invite-panel"><span className="eyebrow">GROW YOUR TEAM</span><h2>Invite a collaborator</h2><p>Enter the email address linked to their CollabSphere account. They must register before you can add them.</p><form className="invite-form" onSubmit={invite}><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="teammate@example.com" required/></label><button className="btn btn-primary" disabled={busy}>{busy?"Adding…":"＋ Add member"}</button></form></section><section className="panel members-panel"><div className="panel-heading"><div><h2>{selected?.title} members</h2><p>People connected to this project.</p></div><span className="count-pill">{selected?.members?.length||1} members</span></div>{(selected?.members||[]).length===0?<Empty icon="♧" title="No members listed" description="Invite a collaborator to get started."/>:<div className="member-list">{(selected.members||[]).map((m,i)=>{const person=typeof m==="object"?m:{_id:m,name:i===0?"Project member":"Member",email:""};return <div className="member-row" key={person._id||i}><div className={`member-avatar avatar-${i%4}`}>{initials(person.name)}</div><div className="member-info"><strong>{person.name||"Project member"}</strong><span>{person.email||"Member of this project"}</span></div><span className="role-pill">{i===0?"Member":"Collaborator"}</span></div>})}</div>}</section></div></>}</>;
}

function AIStudio() {
  const actions=[
    {id:"explain-code",name:"Explain code",short:"EXPLAIN",description:"Understand what a code segment does, step by step.",fields:["code"],label:"Code to explain",placeholder:"Paste a function, component, or code snippet…",output:"explanation"},
    {id:"generate-readme",name:"Generate README",short:"README",description:"Draft project documentation from your project details.",fields:["projectName","description","technologies","code"],output:"readme"},
    {id:"generate-documentation",name:"Generate documentation",short:"DOCS",description:"Create clear technical documentation for a code file.",fields:["code","language","fileName"],output:"documentation"},
  ];
  const [active,setActive]=useState(actions[0]);const [form,setForm]=useState({code:"",projectName:"",description:"",technologies:"",language:"",fileName:""});const [result,setResult]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [copied,setCopied]=useState(false);
  function choose(a){setActive(a);setResult("");setError("");}
  async function submit(e){e.preventDefault();setBusy(true);setError("");setResult("");setCopied(false);try{const payload={};active.fields.forEach(k=>payload[k]=form[k]);if(active.id==="generate-readme"&&!payload.projectName?.trim())throw new Error("Project name is required.");if((active.id!=="generate-readme")&&!payload.code?.trim())throw new Error("Please enter some code first.");const d=await apiRequest(`/ai/${active.id}`,{method:"POST",body:JSON.stringify(payload)});const output=d[active.output];if(!output)throw new Error(d.message||"The AI response did not include generated content.");setResult(output);}catch(err){setError(err.message||"AI request failed. Check your backend AI configuration.");}finally{setBusy(false);}}
  return <><PageHeading eyebrow="GEMINI-POWERED WORKFLOW" title="AI Studio" description="Turn code into clarity and documentation into a head start."/><div className="ai-intro"><div className="ai-spark">✳</div><div><strong>A little help for the hard parts.</strong><p>Choose a tool below. Requests run through your authenticated backend.</p></div><span className="ai-provider">AI TOOLS</span></div><Notice error={error}/><div className="ai-tool-grid">{actions.map(a=><button key={a.id} className={`ai-tool ${active.id===a.id?"ai-tool-active":""}`} onClick={()=>choose(a)}><span className="tool-code">{a.short}</span><span className="tool-title">{a.name}</span><span className="tool-description">{a.description}</span><span className="tool-arrow">↗</span></button>)}</div><div className="ai-workspace"><div className="ai-workspace-head"><div><span className="eyebrow">WORKSPACE / {active.short}</span><h2>{active.name}</h2></div><span className="powered-label">✦ Gemini integration</span></div><form className="ai-form" onSubmit={submit}>{active.id==="generate-readme"?<><label>Project name<input value={form.projectName} onChange={e=>setForm({...form,projectName:e.target.value})} placeholder="e.g. CollabSphere" required/></label><label>Project description<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What does your project do?"/></label><label>Technologies<input value={form.technologies} onChange={e=>setForm({...form,technologies:e.target.value})} placeholder="React, Node.js, MongoDB…"/></label><label>Optional code<textarea rows={5} className="code-textarea" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="Paste code or configuration if useful…"/></label></>:<><div className="ai-two-fields"><label>File name <span className="optional">(optional)</span><input value={form.fileName} onChange={e=>setForm({...form,fileName:e.target.value})} placeholder="src/App.jsx"/></label>{active.id==="generate-documentation"&&<label>Language <span className="optional">(optional)</span><input value={form.language} onChange={e=>setForm({...form,language:e.target.value})} placeholder="JavaScript, Python…"/></label>}</div><label>{active.id==="explain-code"?"Paste your code":"Code to document"}<textarea rows={10} className="code-textarea" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder={active.id==="explain-code"?"function example() { … }":"Paste the source code you want documented…"} required/></label></>}<div className="ai-submit-row"><span>Your code is sent to your configured AI backend for processing.</span><button className="btn btn-primary" disabled={busy}>{busy?<><span className="spinner spinner-light"/> Generating…</>:<>Generate result <span>→</span></>}</button></div></form>{result&&<section className="ai-result"><div className="ai-result-header"><div><span className="eyebrow">GENERATED OUTPUT</span><h3>Your result is ready</h3></div><button className="btn btn-secondary btn-small" onClick={async()=>{try{await navigator.clipboard.writeText(result);setCopied(true);}catch{setError("Clipboard access was blocked by your browser.");}}}>{copied?"✓ Copied":"Copy result"}</button></div><pre>{result}</pre></section>}</div></>;
}

function Profile({user,onUserChange}) {
  const [name,setName]=useState(user?.name||"");const [email,setEmail]=useState(user?.email||"");const [message,setMessage]=useState("");const [error,setError]=useState("");
  useEffect(()=>{setName(user?.name||"");setEmail(user?.email||"");},[user]);
  function save(e){e.preventDefault();const next={...user,name:name.trim(),email:email.trim()};saveSession(localStorage.getItem("token")||localStorage.getItem("authToken"),next);onUserChange(next);setMessage("Display details saved in this browser.");setError("");}
  return <><PageHeading eyebrow="ACCOUNT SETTINGS" title="Your profile" description="Manage the display details used across your workspace."/><Notice error={error} message={message}/><div className="profile-layout"><section className="panel profile-card"><div className="profile-cover"><div className="profile-avatar-large">{initials(name||"Developer")}</div></div><h2>{name||"Developer"}</h2><p>{email||"Add your email address"}</p><span className="role-pill">Workspace member</span><div className="profile-note">Profile editing is local-only because this backend currently exposes a read-only profile endpoint.</div></section><section className="panel profile-form-panel"><div className="panel-heading"><div><h2>Display details</h2><p>These details personalize this browser's workspace.</p></div></div><form className="form-stack" onSubmit={save}><label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/></label><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><button className="btn btn-primary">Save display details</button></form></section></div></>;
}

function Root() {
  const token=localStorage.getItem("token")||localStorage.getItem("authToken");
  return <Routes><Route path="/login" element={token?<Navigate to="/" replace/>:<AuthPage mode="login"/>}/><Route path="/register" element={token?<Navigate to="/" replace/>:<AuthPage mode="register"/>}/><Route path="/*" element={<ProtectedApp/>}/></Routes>;
}
export default function App() { return <BrowserRouter><Root/></BrowserRouter>; }
