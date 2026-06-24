import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Book, Edit, Trash2, BookOpen, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useUser } from './UserContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog.jsx';
import { useToast } from './ui/toast.jsx';

function calcProgress(course) {
  let total = 0; let done = 0;
  if (!course.chapters) return 0;
  course.chapters.forEach((ch) => {
    if (!ch.topics) return;
    ch.topics.forEach((t) => { total++; if (t.completed) done++; })
  });
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

// UPGRADED Dialog form with Max Marks support
function NameDialog({ open, onOpenChange, title, description, value, onChange, sectionValue, onSectionChange, marksValue, onMarksChange, onSave, label, showSectionInput, showMarksInput }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">{label} *</label>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm" />
          </div>
          
          {showMarksInput && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">Maximum Marks for Exams *</label>
              <input type="number" min="1" max="1000" value={marksValue} onChange={(e) => onMarksChange(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm" />
              <p className="text-xs text-gray-500 mt-1">This will be used to calculate percentages in the Exam Results page.</p>
            </div>
          )}

          {showSectionInput && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">Section Name (Optional)</label>
              <input type="text" placeholder="e.g. Section B" value={sectionValue} onChange={(e) => onSectionChange(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm" />
              <p className="text-xs text-gray-500 mt-1">Leave blank to default to Section A.</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => onOpenChange(false)} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
            <button onClick={onSave} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">Save</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Syllabus() {
  const { selectedCampus } = useCampus();
  const { currentUser } = useUser();
  const { addAuditLog } = useAuditLog();
  const toast = useToast();

  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null); 

  const [dialog, setDialog] = useState({ open: false, type: '', value: '', sectionValue: '', marksValue: '100' });
  const [ctx, setCtx] = useState({ gradeId: null, courseId: null, chapterId: null, topicId: null });

  const openDialog = (type, preValue = '', context = {}) => {
    setDialog({ open: true, type, value: preValue, sectionValue: '', marksValue: '100' });
    setCtx((prev) => ({ ...prev, ...context }));
  };
  
  const closeDialog = () => setDialog({ open: false, type: '', value: '', sectionValue: '', marksValue: '100' });
  const updateGrades = (fn) => setGrades((prev) => fn(prev));

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/classes', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }));

        const campusClasses = res.data.filter(c => 
          selectedCampus === 'Both' || selectedCampus === 'All Campuses' || c.campus_name.includes(selectedCampus)
        );

        // STRICT EMPTY FALLBACK: No fake grades
        if (!campusClasses || campusClasses.length === 0) {
          setGrades([]);
          setIsLoading(false);
          return;
        }

        const realGrades = [];
        const seen = new Set();

        campusClasses.forEach(c => {
          const displayName = (selectedCampus === 'Both' || selectedCampus === 'All Campuses') 
            ? `${c.grade_name} (${c.campus_name})` 
            : c.grade_name;

          if (!seen.has(displayName)) {
            seen.add(displayName);
            // STRICT EMPTY FALLBACK: Courses are explicitly empty until fetched
            realGrades.push({
              id: `G_${c.grade_name}_${c.campus_name}`,
              name: displayName,
              courses: []
            });
          }
        });

        realGrades.sort((a, b) => a.name.localeCompare(b.name));
        setGrades(realGrades);

      } catch (error) {
        toast.error('Data Error', { description: 'Could not load curriculum from database.' });
        setGrades([]); // Fallback to empty on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampus]);

  const handleSave = async () => {
    const { type, value, sectionValue, marksValue } = dialog;
    const name = value.trim();
    if (!name) { toast.error('Please enter a name'); return; }

    if (type === 'addGrade') {
      try {
        const targetCampus = (selectedCampus === 'Both' || selectedCampus === 'All Campuses') ? 'North Campus' : selectedCampus;
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/setup/grade', {
          campusName: targetCampus, gradeName: name, sectionName: sectionValue
        }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {
            updateGrades(prev => [...prev, { id: `G${Date.now()}`, name, courses: [] }]);
        });
        toast.success(`Success!`, { description: `${name} added.` });
        closeDialog();
        return;
      } catch (error) { }
    }
    
    // UI-Only interactions (until backend routes are built)
    if (type === 'editGrade') { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, name } : g)); toast.success('Grade updated'); }
    if (type === 'addCourse') { 
        updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: [...g.courses, { id: `C${Date.now()}`, name, maxMarks: parseInt(marksValue) || 100, chapters: [] }] } : g)); 
        toast.success(`Added ${name} (Max: ${marksValue})`); 
    }
    if (type === 'editCourse') { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, name } : c) } : g)); toast.success('Course updated'); }
    if (type === 'addChapter') { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, chapters: [...c.chapters, { id: `CH${Date.now()}`, name, topics: [] }] } : c) } : g)); toast.success(`Added chapter: ${name}`); }
    if (type === 'editChapter') { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId ? { ...ch, name } : ch) } : c) } : g)); toast.success('Chapter updated'); }
    if (type === 'addTopic') { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId ? { ...ch, topics: [...ch.topics, { id: `T${Date.now()}`, name, completed: false }] } : ch) } : c) } : g)); toast.success(`Added topic: ${name}`); }
    if (type === 'editTopic') { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId ? { ...ch, topics: ch.topics.map((t) => t.id === ctx.topicId ? { ...t, name } : t) } : ch) } : c) } : g)); toast.success('Topic updated'); }
    closeDialog();
  };

  const handleDeleteGrade = (gradeId) => { updateGrades((prev) => prev.filter((g) => g.id !== gradeId)); toast.info('Grade Deleted'); };
  const handleDeleteCourse = (gradeId, courseId) => { updateGrades((prev) => prev.map((g) => g.id === gradeId ? { ...g, courses: g.courses.filter((c) => c.id !== courseId) } : g)); if (selectedCourse?.courseId === courseId) setSelectedCourse(null); toast.info('Course deleted'); };
  const handleDeleteChapter = (chapterId) => { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, chapters: c.chapters.filter((ch) => ch.id !== chapterId) } : c) } : g)); toast.info('Chapter deleted'); };
  const handleDeleteTopic = (topicId) => { updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId ? { ...ch, topics: ch.topics.filter((t) => t.id !== topicId) } : ch) } : c) } : g)); toast.info('Topic deleted'); };

  const toggleTopic = (topicId) => {
    updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId ? { ...ch, topics: ch.topics.map((t) => {
      if (t.id !== topicId) return t;
      return { ...t, completed: !t.completed };
    }) } : ch) } : c) } : g));
  };

  const currentGrade = selectedCourse ? grades.find((g) => g.id === selectedCourse.gradeId) : null;
  const currentCourse = currentGrade?.courses.find((c) => c.id === selectedCourse?.courseId);

  const dialogMeta = {
    addGrade:    { title: 'Add New Grade/Class',   desc: `Add a grade to ${selectedCampus}`,      label: 'Grade/Class Name' },
    editGrade:   { title: 'Edit Grade/Class',       desc: 'Update the grade or class name',        label: 'Grade/Class Name' },
    addCourse:   { title: 'Add New Course',         desc: `Add a course to the selected grade`,    label: 'Course Name' },
    editCourse:  { title: 'Edit Course',            desc: 'Update the course name',                label: 'Course Name' },
    addChapter:  { title: 'Add New Chapter',        desc: `Add a chapter to ${currentCourse?.name || 'the course'}`, label: 'Chapter Name' },
    editChapter: { title: 'Edit Chapter',           desc: 'Update the chapter name',               label: 'Chapter Name' },
    addTopic:    { title: 'Add New Topic',          desc: 'Add a topic to the selected chapter',   label: 'Topic Name' },
    editTopic:   { title: 'Edit Topic',             desc: 'Update the topic name',                 label: 'Topic Name' },
  };
  const dm = dialogMeta[dialog.type] || {};

  if (!selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h3 className="text-lg text-black">Syllabus Management</h3><p className="text-sm text-gray-500 mt-1">Manage curriculum for {selectedCampus}</p></div>
          <button onClick={() => openDialog('addGrade')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer w-full sm:w-auto justify-center"><Plus className="size-4" /> Add Grade/Class</button>
        </div>

        {isLoading ? (
          <div className="bg-white border-2 border-black rounded-lg p-12 text-center text-gray-500">Loading curriculum from database...</div>
        ) : (
          <div className="space-y-6">
            {grades.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-lg p-12 text-center"><BookOpen className="size-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No grades added yet.</p></div>
            ) : grades.map((grade) => (
              <div key={grade.id} className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
                <div className="bg-gray-50 p-4 flex items-center justify-between border-b-2 border-gray-200 flex-wrap gap-3">
                  <div className="flex items-center gap-3"><Book className="size-5 text-red-600 hidden sm:block" /><h4 className="text-base text-black font-semibold">{grade.name}</h4><span className="text-sm text-gray-500">({grade.courses.length} courses)</span></div>
                  <div className="flex items-center gap-2"><button onClick={() => openDialog('addCourse', '', { gradeId: grade.id })} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"><Plus className="size-3.5" /> Add Course</button><button onClick={() => openDialog('editGrade', grade.name, { gradeId: grade.id })} className="p-2 hover:bg-gray-200 rounded transition-colors hidden sm:block"><Edit className="size-4 text-gray-600" /></button><button onClick={() => handleDeleteGrade(grade.id)} className="p-2 hover:bg-red-100 rounded transition-colors hidden sm:block"><Trash2 className="size-4 text-red-600" /></button></div>
                </div>
                <div className="p-4 sm:p-6">
                  {(!grade.courses || grade.courses.length === 0) ? (
                    <p className="text-sm text-gray-500 text-center py-6 sm:py-8">No courses added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {grade.courses.map((course) => {
                        const progress = calcProgress(course);
                        return (
                          <div key={course.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-600 transition-colors cursor-pointer group bg-white" onClick={() => { setSelectedCourse({ gradeId: grade.id, courseId: course.id }); setCtx({ gradeId: grade.id, courseId: course.id, chapterId: null, topicId: null }); }}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 pr-2">
                                <BookOpen className="size-5 text-gray-600 group-hover:text-red-600 transition-colors flex-shrink-0" />
                                <div>
                                  <h5 className="text-sm text-black font-medium line-clamp-2">{course.name}</h5>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block border border-gray-200">Max: {course.maxMarks || 100}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0"><button onClick={(e) => { e.stopPropagation(); openDialog('editCourse', course.name, { gradeId: grade.id, courseId: course.id }); }} className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-all"><Edit className="size-3.5 text-gray-600" /></button><button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(grade.id, course.id); }} className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="size-3.5 text-red-600" /></button></div>
                            </div>
                            <div className="space-y-2 mt-auto"><div className="flex justify-between text-xs text-gray-600"><span>{course.chapters ? course.chapters.length : 0} chapters</span><span>{progress}% complete</span></div><div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} /></div></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <NameDialog open={dialog.open} onOpenChange={(o) => !o && closeDialog()} title={dm.title} description={dm.desc} label={dm.label} value={dialog.value} onChange={(v) => setDialog((d) => ({ ...d, value: v }))} sectionValue={dialog.sectionValue} onSectionChange={(v) => setDialog((d) => ({ ...d, sectionValue: v }))} marksValue={dialog.marksValue} onMarksChange={(v) => setDialog((d) => ({...d, marksValue: v}))} showSectionInput={dialog.type === 'addGrade'} showMarksInput={dialog.type === 'addCourse'} onSave={handleSave} />
      </div>
    );
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4"><button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors mt-1 sm:mt-0"><ArrowLeft className="size-5 text-gray-600" /></button><div><h3 className="text-lg text-black font-semibold leading-tight">{currentCourse?.name}</h3><p className="text-sm text-gray-500">{currentGrade?.name} • Max Marks: {currentCourse?.maxMarks || 100} • {selectedCampus}</p></div></div>
        <button onClick={() => openDialog('addChapter', '', { gradeId: currentGrade.id, courseId: currentCourse.id })} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer w-full sm:w-auto justify-center"><Plus className="size-4" /> Add Chapter</button>
      </div>

      {currentCourse && (<div className="bg-white border-2 border-black rounded-lg p-4 sm:p-5 shadow-sm"><div className="flex justify-between mb-3 text-sm text-black"><span className="font-medium">Course Progress</span><span className="font-bold text-green-700">{calcProgress(currentCourse)}%</span></div><div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-600 transition-all duration-500 ease-out" style={{ width: `${calcProgress(currentCourse)}%` }} /></div></div>)}

      <div className="space-y-4">
        {!currentCourse || !currentCourse.chapters || currentCourse.chapters.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-lg p-8 sm:p-12 text-center"><BookOpen className="size-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No chapters added yet.</p></div>
        ) : currentCourse.chapters.map((chapter) => (
          <div key={chapter.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-gray-200"><div className="flex items-center gap-2"><Book className="size-5 text-gray-600 flex-shrink-0" /><h4 className="text-sm text-black font-semibold">{chapter.name}</h4><span className="text-xs text-gray-500 whitespace-nowrap">({chapter.topics ? chapter.topics.length : 0} topics)</span></div><div className="flex items-center gap-2 self-end sm:self-auto"><button onClick={() => openDialog('addTopic', '', { gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id })} className="flex items-center gap-1 px-2 py-1.5 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors"><Plus className="size-3" /> <span className="hidden sm:inline">Add Topic</span></button><button onClick={() => openDialog('editChapter', chapter.name, { gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id })} className="p-1.5 hover:bg-gray-200 rounded transition-colors"><Edit className="size-3.5 text-gray-600" /></button><button onClick={() => handleDeleteChapter(chapter.id)} className="p-1.5 hover:bg-red-100 rounded transition-colors"><Trash2 className="size.3.5 text-red-600" /></button></div></div>
            <div className="p-3 sm:p-4">
              {!chapter.topics || chapter.topics.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No topics added yet.</p>
              ) : (
                <div className="space-y-2">
                  {chapter.topics.map((topic) => (
                    <div key={topic.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors gap-2 sm:gap-4"><div className="flex items-start sm:items-center gap-3 flex-1 min-w-0"><button onClick={() => { setCtx({ gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id, topicId: topic.id }); toggleTopic(topic.id); }} className="flex-shrink-0 mt-0.5 sm:mt-0 focus:outline-none">{topic.completed ? <CheckCircle2 className="size-5 text-green-600" /> : <div className="size-5 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors" />}</button><span className={`text-sm break-words ${topic.completed ? 'text-gray-400 line-through' : 'text-black'}`}>{topic.name}</span></div><div className="flex items-center gap-1 self-end sm:self-auto flex-shrink-0"><button onClick={() => openDialog('editTopic', topic.name, { gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id, topicId: topic.id })} className="p-1.5 hover:bg-gray-200 rounded transition-colors"><Edit className="size-3.5 text-gray-600" /></button><button onClick={() => { setCtx({ gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id, topicId: null }); handleDeleteTopic(topic.id); }} className="p-1.5 hover:bg-red-100 rounded transition-colors"><Trash2 className="size-3.5 text-red-600" /></button></div></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <NameDialog open={dialog.open} onOpenChange={(o) => !o && closeDialog()} title={dm.title} description={dm.desc} label={dm.label} value={dialog.value} onChange={(v) => setDialog((d) => ({ ...d, value: v }))} sectionValue={dialog.sectionValue} onSectionChange={(v) => setDialog((d) => ({ ...d, sectionValue: v }))} marksValue={dialog.marksValue} onMarksChange={(v) => setDialog((d) => ({...d, marksValue: v}))} showSectionInput={dialog.type === 'addGrade'} showMarksInput={dialog.type === 'addCourse'} onSave={handleSave} />
    </div>
  );
}