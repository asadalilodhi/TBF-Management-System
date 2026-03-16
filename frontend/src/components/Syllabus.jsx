import { useState } from 'react';
import { Plus, Book, Edit, Trash2, BookOpen, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useUser } from './UserContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog.jsx';
import { useToast } from './ui/toast.jsx';
import { GRADES } from './Constants.js';

// Seed data
const buildInitialGrades = () =>
  GRADES.map((gradeName, index) => ({
    id: `G${index + 1}`,
    name: gradeName,
    courses:
      index === 0
        ? [
            {
              id: 'C1',
              name: 'Mathematics',
              chapters: [
                {
                  id: 'CH1',
                  name: 'Numbers 1-10',
                  topics: [
                    { id: 'T1', name: 'Counting 1-5', completed: true },
                    { id: 'T2', name: 'Counting 6-10', completed: true },
                    { id: 'T3', name: 'Number Recognition', completed: false },
                  ],
                },
                {
                  id: 'CH2',
                  name: 'Basic Addition',
                  topics: [
                    { id: 'T4', name: 'Adding Single Digits', completed: false },
                    { id: 'T5', name: 'Word Problems', completed: false },
                  ],
                },
              ],
            },
            {
              id: 'C2',
              name: 'English',
              chapters: [
                {
                  id: 'CH3',
                  name: 'Alphabets',
                  topics: [
                    { id: 'T6', name: 'A to M', completed: true },
                    { id: 'T7', name: 'N to Z', completed: false },
                  ],
                },
              ],
            },
          ]
        : [],
  }));

function calcProgress(course) {
  let total = 0;
  let done = 0;
  course.chapters.forEach((ch) =>
    ch.topics.forEach((t) => { total++; if (t.completed) done++; })
  );
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

// Simple dialog form
function NameDialog({ open, onOpenChange, title, description, value, onChange, onSave, label }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">{label} *</label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
              onKeyDown={(e) => e.key === 'Enter' && onSave()}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => onOpenChange(false)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
            <button onClick={onSave}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">Save</button>
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

  const [grades, setGrades] = useState(buildInitialGrades);
  const [selectedCourse, setSelectedCourse] = useState(null); // { gradeId, courseId }

  // Dialog state
  const [dialog, setDialog] = useState({ open: false, type: '', value: '' });
  const [ctx, setCtx] = useState({ gradeId: null, courseId: null, chapterId: null, topicId: null });

  const openDialog = (type, preValue = '', context = {}) => {
    setDialog({ open: true, type, value: preValue });
    setCtx((prev) => ({ ...prev, ...context }));
  };
  const closeDialog = () => setDialog({ open: false, type: '', value: '' });

  // Updaters
  const updateGrades = (fn) => setGrades((prev) => fn(prev));

  const handleSave = () => {
    const { type, value } = dialog;
    const name = value.trim();
    if (!name) { toast.error('Please enter a name'); return; }

    if (type === 'addGrade') {
      updateGrades((prev) => [...prev, { id: `G${Date.now()}`, name, courses: [] }]);
      addAuditLog({ action: 'Syllabus - Grade Added', user: currentUser.name, details: `${name} added for ${selectedCampus}` });
      toast.success(`Added ${name}`);
    }
    if (type === 'editGrade') {
      updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId ? { ...g, name } : g));
      addAuditLog({ action: 'Syllabus - Grade Updated', user: currentUser.name, details: `Grade renamed to ${name}` });
      toast.success('Grade updated');
    }
    if (type === 'addCourse') {
      updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
        ? { ...g, courses: [...g.courses, { id: `C${Date.now()}`, name, chapters: [] }] } : g));
      toast.success(`Added ${name}`);
    }
    if (type === 'editCourse') {
      updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
        ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId ? { ...c, name } : c) } : g));
      toast.success('Course updated');
    }
    if (type === 'addChapter') {
      updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
        ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId
            ? { ...c, chapters: [...c.chapters, { id: `CH${Date.now()}`, name, topics: [] }] } : c) } : g));
      toast.success(`Added chapter: ${name}`);
    }
    if (type === 'editChapter') {
      updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
        ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId
            ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId ? { ...ch, name } : ch) } : c) } : g));
      toast.success('Chapter updated');
    }
    if (type === 'addTopic') {
      updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
        ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId
            ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId
                ? { ...ch, topics: [...ch.topics, { id: `T${Date.now()}`, name, completed: false }] } : ch) } : c) } : g));
      toast.success(`Added topic: ${name}`);
    }
    if (type === 'editTopic') {
      updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
        ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId
            ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId
                ? { ...ch, topics: ch.topics.map((t) => t.id === ctx.topicId ? { ...t, name } : t) } : ch) } : c) } : g));
      toast.success('Topic updated');
    }
    closeDialog();
  };

  const handleDeleteGrade = (gradeId) => {
    updateGrades((prev) => prev.filter((g) => g.id !== gradeId));
    toast.info('Grade deleted');
  };

  const handleDeleteCourse = (gradeId, courseId) => {
    updateGrades((prev) => prev.map((g) => g.id === gradeId
      ? { ...g, courses: g.courses.filter((c) => c.id !== courseId) } : g));
    if (selectedCourse?.courseId === courseId) setSelectedCourse(null);
    toast.info('Course deleted');
  };

  const handleDeleteChapter = (chapterId) => {
    updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
      ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId
          ? { ...c, chapters: c.chapters.filter((ch) => ch.id !== chapterId) } : c) } : g));
    toast.info('Chapter deleted');
  };

  const handleDeleteTopic = (topicId) => {
    updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
      ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId
          ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId
              ? { ...ch, topics: ch.topics.filter((t) => t.id !== topicId) } : ch) } : c) } : g));
    toast.info('Topic deleted');
  };

  const toggleTopic = (topicId) => {
    updateGrades((prev) => prev.map((g) => g.id === ctx.gradeId
      ? { ...g, courses: g.courses.map((c) => c.id === ctx.courseId
          ? { ...c, chapters: c.chapters.map((ch) => ch.id === ctx.chapterId
              ? { ...ch, topics: ch.topics.map((t) => {
                  if (t.id !== topicId) return t;
                  const nc = !t.completed;
                  addAuditLog({ action: 'Syllabus - Topic Progress Updated', user: currentUser.name,
                    details: `${t.name} marked ${nc ? 'completed' : 'incomplete'}` });
                  toast.success(nc ? 'Topic marked completed' : 'Topic marked incomplete');
                  return { ...t, completed: nc };
                }) } : ch) } : c) } : g));
  };

  const currentGrade = selectedCourse ? grades.find((g) => g.id === selectedCourse.gradeId) : null;
  const currentCourse = currentGrade?.courses.find((c) => c.id === selectedCourse?.courseId);

  const dialogMeta = {
    addGrade:    { title: 'Add New Grade/Class',   desc: 'Enter the grade or class name',         label: 'Grade/Class Name' },
    editGrade:   { title: 'Edit Grade/Class',       desc: 'Update the grade or class name',        label: 'Grade/Class Name' },
    addCourse:   { title: 'Add New Course',         desc: `Add a course to the selected grade`,    label: 'Course Name' },
    editCourse:  { title: 'Edit Course',            desc: 'Update the course name',                label: 'Course Name' },
    addChapter:  { title: 'Add New Chapter',        desc: `Add a chapter to ${currentCourse?.name || 'the course'}`, label: 'Chapter Name' },
    editChapter: { title: 'Edit Chapter',           desc: 'Update the chapter name',               label: 'Chapter Name' },
    addTopic:    { title: 'Add New Topic',          desc: 'Add a topic to the selected chapter',   label: 'Topic Name' },
    editTopic:   { title: 'Edit Topic',             desc: 'Update the topic name',                 label: 'Topic Name' },
  };
  const dm = dialogMeta[dialog.type] || {};

  // ── Main view ─────────────────────────────────────────────────────────────
  if (!selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg text-black">Syllabus Management</h3>
            <p className="text-sm text-gray-500 mt-1">Manage curriculum for {selectedCampus}</p>
          </div>
          <button onClick={() => openDialog('addGrade')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer">
            <Plus className="size-4" /> Add Grade/Class
          </button>
        </div>

        <div className="space-y-6">
          {grades.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-lg p-12 text-center">
              <BookOpen className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No grades added yet.</p>
            </div>
          ) : grades.map((grade) => (
            <div key={grade.id} className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
              <div className="bg-gray-50 p-4 flex items-center justify-between border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <Book className="size-5 text-red-600" />
                  <h4 className="text-base text-black">{grade.name}</h4>
                  <span className="text-sm text-gray-500">({grade.courses.length} courses)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openDialog('addCourse', '', { gradeId: grade.id })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                    <Plus className="size-3.5" /> Add Course
                  </button>
                  <button onClick={() => openDialog('editGrade', grade.name, { gradeId: grade.id })}
                    className="p-2 hover:bg-gray-200 rounded transition-colors">
                    <Edit className="size-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDeleteGrade(grade.id)}
                    className="p-2 hover:bg-red-100 rounded transition-colors">
                    <Trash2 className="size-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {grade.courses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No courses added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grade.courses.map((course) => {
                      const progress = calcProgress(course);
                      return (
                        <div key={course.id}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-600 transition-colors cursor-pointer group"
                          onClick={() => {
                            setSelectedCourse({ gradeId: grade.id, courseId: course.id });
                            setCtx({ gradeId: grade.id, courseId: course.id, chapterId: null, topicId: null });
                          }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="size-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                              <h5 className="text-sm text-black font-medium">{course.name}</h5>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); openDialog('editCourse', course.name, { gradeId: grade.id, courseId: course.id }); }}
                                className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-all">
                                <Edit className="size-3.5 text-gray-600" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(grade.id, course.id); }}
                                className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="size-3.5 text-red-600" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{course.chapters.length} chapters</span>
                              <span>{progress}% complete</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-600 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <NameDialog
          open={dialog.open}
          onOpenChange={(o) => !o && closeDialog()}
          title={dm.title} description={dm.desc} label={dm.label}
          value={dialog.value} onChange={(v) => setDialog((d) => ({ ...d, value: v }))}
          onSave={handleSave}
        />
      </div>
    );
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedCourse(null)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft className="size-5 text-gray-600" />
          </button>
          <div>
            <h3 className="text-lg text-black">{currentCourse?.name}</h3>
            <p className="text-sm text-gray-500">{currentGrade?.name} • {selectedCampus}</p>
          </div>
        </div>
        <button onClick={() => openDialog('addChapter', '', { gradeId: currentGrade.id, courseId: currentCourse.id })}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer">
          <Plus className="size-4" /> Add Chapter
        </button>
      </div>

      {currentCourse && (
        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex justify-between mb-2 text-sm text-black">
            <span>Course Progress</span>
            <span className="font-medium">{calcProgress(currentCourse)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 transition-all" style={{ width: `${calcProgress(currentCourse)}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!currentCourse || currentCourse.chapters.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-lg p-12 text-center">
            <BookOpen className="size-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No chapters added yet.</p>
          </div>
        ) : currentCourse.chapters.map((chapter) => (
          <div key={chapter.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex items-center justify-between border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Book className="size-5 text-gray-600" />
                <h4 className="text-sm text-black font-medium">{chapter.name}</h4>
                <span className="text-xs text-gray-500">({chapter.topics.length} topics)</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openDialog('addTopic', '', { gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id })}
                  className="flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors">
                  <Plus className="size-3" /> Add Topic
                </button>
                <button onClick={() => openDialog('editChapter', chapter.name, { gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id })}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <Edit className="size-3.5 text-gray-600" />
                </button>
                <button onClick={() => handleDeleteChapter(chapter.id)}
                  className="p-1.5 hover:bg-red-100 rounded transition-colors">
                  <Trash2 className="size-3.5 text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {chapter.topics.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No topics added yet.</p>
              ) : (
                <div className="space-y-2">
                  {chapter.topics.map((topic) => (
                    <div key={topic.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <button onClick={() => {
                          setCtx({ gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id, topicId: topic.id });
                          toggleTopic(topic.id);
                        }} className="flex-shrink-0">
                          {topic.completed
                            ? <CheckCircle2 className="size-5 text-green-600" />
                            : <div className="size-5 border-2 border-gray-300 rounded-full" />}
                        </button>
                        <span className={`text-sm ${topic.completed ? 'text-gray-400 line-through' : 'text-black'}`}>
                          {topic.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDialog('editTopic', topic.name, { gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id, topicId: topic.id })}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                          <Edit className="size-3.5 text-gray-600" />
                        </button>
                        <button onClick={() => {
                          setCtx({ gradeId: currentGrade.id, courseId: currentCourse.id, chapterId: chapter.id, topicId: null });
                          handleDeleteTopic(topic.id);
                        }} className="p-1.5 hover:bg-red-100 rounded transition-colors">
                          <Trash2 className="size-3.5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <NameDialog
        open={dialog.open}
        onOpenChange={(o) => !o && closeDialog()}
        title={dm.title} description={dm.desc} label={dm.label}
        value={dialog.value} onChange={(v) => setDialog((d) => ({ ...d, value: v }))}
        onSave={handleSave}
      />
    </div>
  );
}