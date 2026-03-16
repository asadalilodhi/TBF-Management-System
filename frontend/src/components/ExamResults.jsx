import { useState } from 'react';
import { Save, Calculator, Plus, ArrowLeft, FileText, RotateCcw } from 'lucide-react';
import { useCampus } from './CampusContext.jsx';
import { useAuditLog } from './AuditLogContext.jsx';
import { useUser } from './UserContext.jsx';
import { Checkbox } from './ui/checkbox.jsx';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from './ui/dialog.jsx';
import { Button } from './ui/button.jsx';
import { useToast } from './ui/toast.jsx';

const subjects = [
  { name: 'Mathematics', total: 100 },
  { name: 'English', total: 100 },
  { name: 'Urdu', total: 100 },
  { name: 'Science', total: 50 },
  { name: 'Social Studies', total: 50 },
];

const mockStudentsForExam = {
  'Grade 1': [
    { studentId: '1', studentName: 'Ali Hassan', grNumber: 'GR009' },
    { studentId: '2', studentName: 'Hira Qamar', grNumber: 'GR010' },
    { studentId: '3', studentName: 'Sara Ahmed', grNumber: 'GR011' },
  ],
  'Grade 2': [
    { studentId: '5', studentName: 'Fatima Noor', grNumber: 'GR004' },
    { studentId: '6', studentName: 'Maryam Siddiqui', grNumber: 'GR008' },
    { studentId: '7', studentName: 'Bilal Khan', grNumber: 'GR013' },
  ],
  'Grade 3': [
    { studentId: '9', studentName: 'Hassan Ali', grNumber: 'GR003' },
    { studentId: '10', studentName: 'Ibrahim Qureshi', grNumber: 'GR007' },
    { studentId: '11', studentName: 'Zara Malik', grNumber: 'GR015' },
  ],
  'Grade 4': [
    { studentId: '13', studentName: 'Ayesha Malik', grNumber: 'GR002' },
    { studentId: '14', studentName: 'Zainab Hussain', grNumber: 'GR006' },
    { studentId: '15', studentName: 'Umar Shahid', grNumber: 'GR017' },
  ],
  'Grade 5': [
    { studentId: '17', studentName: 'Muhammad Ahmed Khan', grNumber: 'GR001' },
    { studentId: '18', studentName: 'Usman Farooq', grNumber: 'GR005' },
    { studentId: '19', studentName: 'Sana Iqbal', grNumber: 'GR019' },
  ],
};

const mockSavedExams = [
  {
    id: 'EX001', name: 'Term 1 Midterm', class: 'Grade 3',
    campus: 'North Campus', date: '2026-01-15',
    results: [
      {
        studentId: '9', studentName: 'Hassan Ali', grNumber: 'GR003',
        subjects: {
          Mathematics: { obtained: 85, total: 100 },
          English: { obtained: 78, total: 100 },
          Urdu: { obtained: 92, total: 100 },
          Science: { obtained: 42, total: 50 },
          'Social Studies': { obtained: 38, total: 50 },
        },
      },
    ],
  },
];

function makeEmptySubjects() {
  const s = {};
  subjects.forEach((sub) => { s[sub.name] = { obtained: null, total: sub.total }; });
  return s;
}

function calcGrade(result) {
  let totalObtained = 0;
  let totalMarks = 0;
  let allFilled = true;
  Object.values(result.subjects).forEach((sub) => {
    totalMarks += sub.total;
    if (sub.obtained !== null) totalObtained += sub.obtained;
    else allFilled = false;
  });
  if (!allFilled) return { total: '-', percentage: '-', grade: '-' };
  const pct = (totalObtained / totalMarks) * 100;
  let grade = 'F';
  if (pct >= 90) grade = 'A+';
  else if (pct >= 80) grade = 'A';
  else if (pct >= 70) grade = 'B';
  else if (pct >= 60) grade = 'C';
  else if (pct >= 50) grade = 'D';
  return { total: totalObtained, percentage: pct.toFixed(1), grade };
}

export function ExamResults() {
  const { selectedCampus } = useCampus();
  const { addAuditLog } = useAuditLog();
  const { currentUser } = useUser();
  const toast = useToast();

  const [viewMode, setViewMode] = useState('list');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isNewExam, setIsNewExam] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Grade 1');
  const [examName, setExamName] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [savedExams, setSavedExams] = useState(mockSavedExams);
  const [lastSavedResults, setLastSavedResults] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showReportCard, setShowReportCard] = useState(false);
  const [reportCardIndex, setReportCardIndex] = useState(0);
  const [showNewExamDialog, setShowNewExamDialog] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamClass, setNewExamClass] = useState('Grade 1');

  const hasUnsavedChanges =
    JSON.stringify(studentResults) !== JSON.stringify(lastSavedResults);

  const initResults = (className, savedResults) => {
    if (savedResults) {
      setStudentResults(JSON.parse(JSON.stringify(savedResults)));
      setLastSavedResults(JSON.parse(JSON.stringify(savedResults)));
    } else {
      const newResults = mockStudentsForExam[className].map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        grNumber: s.grNumber,
        subjects: makeEmptySubjects(),
      }));
      setStudentResults(newResults);
      setLastSavedResults(JSON.parse(JSON.stringify(newResults)));
    }
  };

  const handleOpenExam = (exam) => {
    setSelectedExam(exam);
    setExamName(exam.name);
    setSelectedClass(exam.class);
    initResults(exam.class, exam.results);
    setIsNewExam(false);
    setViewMode('entry');
    setSelectedStudents(new Set());
  };

  const handleCreateNewExam = () => {
    if (!newExamName.trim()) {
      toast.error('Missing Exam Name', { description: 'Please enter an exam name' });
      return;
    }
    setExamName(newExamName);
    setSelectedClass(newExamClass);
    initResults(newExamClass);
    setIsNewExam(true);
    setSelectedExam(null);
    setShowNewExamDialog(false);
    setViewMode('entry');
    setSelectedStudents(new Set());
    setNewExamName('');
  };

  const handleMarksChange = (studentId, subjectName, value) => {
    const marks = value === '' ? null : parseFloat(value);
    const subjectMax = subjects.find((s) => s.name === subjectName)?.total || 100;
    if (marks !== null && marks > subjectMax) {
      toast.error('Invalid Marks', { description: `Cannot exceed ${subjectMax}` });
      return;
    }
    setStudentResults((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? {
              ...r,
              subjects: {
                ...r.subjects,
                [subjectName]: { ...r.subjects[subjectName], obtained: marks },
              },
            }
          : r
      )
    );
  };

  const handleReset = () => {
    setStudentResults(JSON.parse(JSON.stringify(lastSavedResults)));
    toast.info('Results Reset', { description: 'Reverted to last saved state' });
  };

  const handleSubmitResults = () => {
    const incomplete = studentResults.filter((r) =>
      Object.values(r.subjects).some((s) => s.obtained === null)
    );
    if (incomplete.length > 0) {
      toast.error('Incomplete Results', {
        description: `${incomplete.length} student(s) have missing marks.`,
      });
      return;
    }

    if (isNewExam) {
      const newExam = {
        id: `EX${String(savedExams.length + 1).padStart(3, '0')}`,
        name: examName,
        class: selectedClass,
        campus: selectedCampus,
        date: new Date().toISOString().split('T')[0],
        results: JSON.parse(JSON.stringify(studentResults)),
      };
      setSavedExams([...savedExams, newExam]);
      setSelectedExam(newExam);
      setIsNewExam(false);
    } else if (selectedExam) {
      setSavedExams((prev) =>
        prev.map((e) =>
          e.id === selectedExam.id
            ? { ...e, results: JSON.parse(JSON.stringify(studentResults)) }
            : e
        )
      );
    }
    setLastSavedResults(JSON.parse(JSON.stringify(studentResults)));
    addAuditLog({
      action: 'Exam Results Entered',
      user: currentUser.name,
      details: `${selectedCampus} - ${selectedClass} - ${examName}`,
    });
    toast.success('Results Submitted', {
      description: `Saved for ${studentResults.length} students`,
    });
  };

  const handleSelectAll = (checked) => {
    setSelectedStudents(
      checked ? new Set(studentResults.map((s) => s.studentId)) : new Set()
    );
  };

  const handleSelectStudent = (studentId, checked) => {
    const next = new Set(selectedStudents);
    checked ? next.add(studentId) : next.delete(studentId);
    setSelectedStudents(next);
  };

  const handleOpenReportCards = () => {
    if (selectedStudents.size === 0) {
      toast.error('No Students Selected', { description: 'Select at least one student' });
      return;
    }
    setReportCardIndex(0);
    setShowReportCard(true);
  };

  const selectedStudentsList = studentResults.filter((s) =>
    selectedStudents.has(s.studentId)
  );
  const campusExams = savedExams.filter((e) => e.campus === selectedCampus);

  // ── List view ─────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg text-black">Exams & Results</h3>
              <p className="text-sm text-gray-500 mt-1">Manage exam results for {selectedCampus}</p>
            </div>
            <button
              onClick={() => setShowNewExamDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Plus className="size-4" />
              Create New Exam
            </button>
          </div>

          <div className="grid gap-4">
            {campusExams.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FileText className="size-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-black mb-2">No Exams Yet</h4>
                <p className="text-sm text-gray-500 mb-4">Create your first exam to start entering results</p>
                <button
                  onClick={() => setShowNewExamDialog(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Create New Exam
                </button>
              </div>
            ) : (
              campusExams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => handleOpenExam(exam)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 lg:p-6 hover:border-red-600 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="text-black font-semibold">{exam.name}</h4>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          {exam.class}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>{exam.campus}</span>
                        <span>{new Date(exam.date).toLocaleDateString()}</span>
                        <span>{exam.results.length} students</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">View/Edit →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Exam Dialog */}
        <Dialog open={showNewExamDialog} onOpenChange={setShowNewExamDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>Enter exam details to begin entering results</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Term 1 Final"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  value={newExamClass}
                  onChange={(e) => setNewExamClass(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                >
                  {Object.keys(mockStudentsForExam).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewExamDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateNewExam} className="bg-red-600 hover:bg-red-700 text-white">
                Create Exam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ── Entry view ────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (
                  hasUnsavedChanges &&
                  !window.confirm('You have unsaved changes. Go back anyway?')
                )
                  return;
                setViewMode('list');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h3 className="text-lg text-black">{examName}</h3>
              <p className="text-sm text-gray-500">{selectedClass} • {selectedCampus}</p>
            </div>
          </div>
          {selectedStudents.size > 0 && (
            <button
              onClick={handleOpenReportCards}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FileText className="size-4" />
              Report Card ({selectedStudents.size})
            </button>
          )}
        </div>

        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">⚠ You have unsaved changes. Click "Submit Results" to save.</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedStudents.size === studentResults.length && studentResults.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm">GR #</th>
                  <th className="px-4 py-3 text-left text-sm">Student Name</th>
                  {subjects.map((sub) => (
                    <th key={sub.name} className="px-4 py-3 text-center text-xs">
                      {sub.name}<br />
                      <span className="text-gray-300">(Max: {sub.total})</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm bg-gray-800">Total</th>
                  <th className="px-4 py-3 text-center text-sm bg-gray-800">%</th>
                  <th className="px-4 py-3 text-center text-sm bg-gray-800">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {studentResults.map((result) => {
                  const { total, percentage, grade } = calcGrade(result);
                  return (
                    <tr
                      key={result.studentId}
                      className={`hover:bg-gray-50 ${selectedStudents.has(result.studentId) ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedStudents.has(result.studentId)}
                          onCheckedChange={(checked) => handleSelectStudent(result.studentId, checked)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{result.grNumber}</td>
                      <td className="px-4 py-3 text-sm text-black">{result.studentName}</td>
                      {subjects.map((sub) => (
                        <td key={sub.name} className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              min="0"
                              max={sub.total}
                              value={result.subjects[sub.name].obtained ?? ''}
                              onChange={(e) => handleMarksChange(result.studentId, sub.name, e.target.value)}
                              placeholder="0"
                              className="w-20 px-2 py-1 text-center border-2 border-gray-300 rounded focus:border-red-600 focus:outline-none text-sm"
                            />
                            <select
                              className="w-20 px-1 py-1 text-xs border border-gray-200 rounded focus:border-red-600 focus:outline-none"
                              value=""
                              onChange={(e) =>
                                e.target.value &&
                                handleMarksChange(result.studentId, sub.name, e.target.value)
                              }
                            >
                              <option value="">Quick</option>
                              {Array.from({ length: Math.floor(sub.total / 10) + 1 }, (_, i) => {
                                const v = Math.min(i * 10, sub.total);
                                return <option key={v} value={v}>{v}</option>;
                              })}
                              <option value={sub.total}>{sub.total}</option>
                            </select>
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center text-sm text-black bg-gray-50">{total}</td>
                      <td className="px-4 py-3 text-center text-sm text-black bg-gray-50">
                        {percentage !== '-' ? `${percentage}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center bg-gray-50">
                        {grade !== '-' ? (
                          <span className={`px-2 py-1 text-xs rounded ${
                            grade === 'A+' || grade === 'A'
                              ? 'bg-green-100 text-green-800'
                              : grade === 'B' || grade === 'C'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {grade}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between bg-white border-2 border-gray-200 rounded-lg p-4 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors text-sm ${
                hasUnsavedChanges
                  ? 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="size-4" />
              Undo / Reset
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calculator className="size-4" />
              <span>Grades auto-calculated</span>
            </div>
          </div>
          <button
            onClick={handleSubmitResults}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm cursor-pointer"
          >
            <Save className="size-4" />
            Submit Results
          </button>
        </div>
      </div>

      {/* Report Card Dialog */}
      <Dialog open={showReportCard} onOpenChange={setShowReportCard}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Report Card</DialogTitle>
            <DialogDescription>
              Viewing {reportCardIndex + 1} of {selectedStudentsList.length}
            </DialogDescription>
          </DialogHeader>
          {selectedStudentsList[reportCardIndex] && (() => {
            const student = selectedStudentsList[reportCardIndex];
            const { total, percentage, grade } = calcGrade(student);
            return (
              <div className="space-y-6 py-4">
                <div className="text-center border-b-2 border-gray-200 pb-4">
                  <h3 className="text-2xl font-bold text-black">{student.studentName}</h3>
                  <p className="text-gray-600 mt-1">GR: {student.grNumber}</p>
                  <p className="text-sm text-gray-500">{selectedClass} • {examName}</p>
                </div>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        {['Subject', 'Obtained', 'Total', 'Percentage'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-sm text-black">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(student.subjects).map(([name, marks]) => (
                        <tr key={name}>
                          <td className="px-4 py-3 text-sm text-black">{name}</td>
                          <td className="px-4 py-3 text-center text-sm">{marks.obtained ?? '-'}</td>
                          <td className="px-4 py-3 text-center text-sm">{marks.total}</td>
                          <td className="px-4 py-3 text-center text-sm">
                            {marks.obtained !== null
                              ? `${((marks.obtained / marks.total) * 100).toFixed(1)}%`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3 text-sm text-black">Total</td>
                        <td className="px-4 py-3 text-center text-sm">{total}</td>
                        <td className="px-4 py-3 text-center text-sm">400</td>
                        <td className="px-4 py-3 text-center text-sm">
                          {percentage !== '-' ? `${percentage}%` : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Overall Grade</p>
                    <p className="text-3xl font-bold text-black">{grade}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Percentage</p>
                    <p className="text-3xl font-bold text-black">
                      {percentage !== '-' ? `${percentage}%` : '-'}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">Teacher's Comments:</p>
                  <textarea
                    className="w-full p-2 border-2 border-gray-200 rounded-lg resize-none text-sm"
                    rows={3}
                    placeholder="Enter comments here…"
                  />
                </div>
              </div>
            );
          })()}
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setReportCardIndex(Math.max(0, reportCardIndex - 1))}
              disabled={reportCardIndex === 0}
            >
              ← Previous
            </Button>
            <span className="text-sm text-gray-600 self-center">
              {reportCardIndex + 1} / {selectedStudentsList.length}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setReportCardIndex(Math.min(selectedStudentsList.length - 1, reportCardIndex + 1))
              }
              disabled={reportCardIndex === selectedStudentsList.length - 1}
            >
              Next →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}