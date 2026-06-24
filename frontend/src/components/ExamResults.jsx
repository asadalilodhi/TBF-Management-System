import { useState, useEffect } from 'react';
import axios from 'axios';
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

// Helper functions for dynamic subjects
function makeEmptySubjects(courseList) {
  const s = {};
  courseList.forEach((sub) => { s[sub.name] = { obtained: null, total: sub.maxMarks }; });
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
  const [selectedClass, setSelectedClass] = useState('');
  const [examName, setExamName] = useState('');
  
  const [currentSubjects, setCurrentSubjects] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [savedExams, setSavedExams] = useState([]); 
  const [lastSavedResults, setLastSavedResults] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  
  const [showReportCard, setShowReportCard] = useState(false);
  const [reportCardIndex, setReportCardIndex] = useState(0);
  const [showNewExamDialog, setShowNewExamDialog] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamClass, setNewExamClass] = useState('');
  
  // NEW: Dynamic state for the class dropdown
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const hasUnsavedChanges = JSON.stringify(studentResults) !== JSON.stringify(lastSavedResults);

  // ── 1. INITIAL DATA FETCH (Exams & Classes) ──────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch Exams
        const examsRes = await axios.get('http://localhost:5000/api/exams', {
          headers: { Authorization: `Bearer ${token}` },
          params: { campus: selectedCampus }
        }).catch(() => ({ data: [] }));

        // Fetch Classes for the specific campus
        const classesRes = await axios.get('http://localhost:5000/api/classes', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }));

        const liveExams = Array.isArray(examsRes.data) ? examsRes.data : [];
        setSavedExams(liveExams);

        // Filter classes for the dropdown
        const campusClasses = (classesRes.data || [])
          .filter(c => selectedCampus === 'Both' || selectedCampus === 'All Campuses' || c.campus_name.includes(selectedCampus))
          .map(c => c.grade_name);
        
        // Remove duplicates (e.g., if there is Grade 1 Section A and Grade 1 Section B)
        const uniqueClasses = [...new Set(campusClasses)].sort();
        setAvailableClasses(uniqueClasses);
        
        // Auto-select first class if available
        if (uniqueClasses.length > 0) {
          setNewExamClass(uniqueClasses[0]);
        } else {
          setNewExamClass('');
        }

      } catch (error) {
        toast.error('Load Error', { description: 'Could not fetch data.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCampus && selectedCampus !== 'No Campus Available') {
      fetchData();
    } else {
      setSavedExams([]);
      setAvailableClasses([]);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampus]);

  const handleOpenExam = (exam) => {
    setSelectedExam(exam);
    setExamName(exam.name);
    setSelectedClass(exam.class);
    
    // Automatically rebuild headers from the saved exam data
    if (exam.results.length > 0) {
        const pastSubjects = Object.keys(exam.results[0].subjects).map(key => ({
            name: key, 
            maxMarks: exam.results[0].subjects[key].total
        }));
        setCurrentSubjects(pastSubjects);
    }

    setStudentResults(JSON.parse(JSON.stringify(exam.results)));
    setLastSavedResults(JSON.parse(JSON.stringify(exam.results)));
    setIsNewExam(false);
    setViewMode('entry');
    setSelectedStudents(new Set());
  };

  const handleCreateNewExam = async () => {
    if (!newExamName.trim() || !newExamClass) {
      toast.error('Missing Information', { description: 'Please enter a name and select a class.' });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch real students
      const studentRes = await axios.get('http://localhost:5000/api/students', {
        headers: { Authorization: `Bearer ${token}` },
        params: { campus: selectedCampus, grade: newExamClass }
      }).catch(() => ({ data: [] }));
      const rosterData = studentRes.data || [];

      // 2. Fetch real syllabus/courses
      const courseRes = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
          params: { campus: selectedCampus, grade: newExamClass }
      }).catch(() => ({ data: [] }));
      const courseData = courseRes.data || [];

      // 3. The "Empty Syllabus" check
      if (courseData.length === 0) {
          toast.error("Cannot Create Exam", { description: `No subjects defined for ${newExamClass} in the Syllabus.` });
          setIsLoading(false);
          return; 
      }

      setCurrentSubjects(courseData);

      const newResults = rosterData.map((s) => ({
        studentId: s.studentId || s.id,
        studentName: s.studentName || s.full_name || 'Unnamed Student',
        grNumber: s.grNumber || s.admission_number,
        subjects: makeEmptySubjects(courseData),
      }));

      setStudentResults(newResults);
      setLastSavedResults(JSON.parse(JSON.stringify(newResults)));
      
      setExamName(newExamName);
      setSelectedClass(newExamClass);
      setIsNewExam(true);
      setSelectedExam(null);
      setShowNewExamDialog(false);
      setViewMode('entry');
      setSelectedStudents(new Set());
      setNewExamName('');
    } catch (error) {
      toast.error('Error', { description: 'Could not fetch class data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarksChange = (studentId, subjectName, value) => {
    const marks = value === '' ? null : parseFloat(value);
    const subjectMax = currentSubjects.find((s) => s.name === subjectName)?.maxMarks || 100;
    
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

  const handleSubmitResults = async () => {
    const incomplete = studentResults.filter((r) =>
      Object.values(r.subjects).some((s) => s.obtained === null)
    );
    if (incomplete.length > 0) {
      toast.error('Incomplete Results', {
        description: `${incomplete.length} student(s) have missing marks.`,
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: examName,
        class: selectedClass,
        campus: selectedCampus,
        date: new Date().toISOString().split('T')[0],
        results: studentResults,
      };

      if (isNewExam) {
        const res = await axios.post('http://localhost:5000/api/exams', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedExams([...savedExams, res.data]);
        setSelectedExam(res.data);
        setIsNewExam(false);
      } else if (selectedExam) {
        await axios.put(`http://localhost:5000/api/exams/${selectedExam.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedExams((prev) =>
          prev.map((e) => (e.id === selectedExam.id ? { ...e, results: studentResults } : e))
        );
      }
      
      setLastSavedResults(JSON.parse(JSON.stringify(studentResults)));
      addAuditLog({ action: 'Exam Results Entered', user: currentUser.name, details: `${selectedCampus} - ${selectedClass} - ${examName}` });
      toast.success('Results Submitted', { description: `Saved for ${studentResults.length} students` });
    } catch (error) {
      toast.error('Save Error', { description: 'Failed to save results.' });
    }
  };

  const handleSelectAll = (checked) => { setSelectedStudents(checked ? new Set(studentResults.map((s) => s.studentId)) : new Set()); };
  const handleSelectStudent = (studentId, checked) => { const next = new Set(selectedStudents); checked ? next.add(studentId) : next.delete(studentId); setSelectedStudents(next); };

  const handleOpenReportCards = () => {
    if (selectedStudents.size === 0) { toast.error('No Students Selected', { description: 'Select at least one student' }); return; }
    setReportCardIndex(0);
    setShowReportCard(true);
  };

  const selectedStudentsList = studentResults.filter((s) => selectedStudents.has(s.studentId));
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
              disabled={isLoading}
            >
              <Plus className="size-4" />
              Create New Exam
            </button>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
               <div className="p-12 text-center text-gray-500">Loading exams...</div>
            ) : campusExams.length === 0 ? (
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
                        <span>{exam.results?.length || 0} students</span>
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
                  disabled={availableClasses.length === 0}
                >
                  {/* Dynamic Database Values */}
                  {availableClasses.length > 0 ? (
                    availableClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  ) : (
                    <option value="">No classes available</option>
                  )}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewExamDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateNewExam} 
                disabled={isLoading || !newExamClass} 
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Create Exam'}
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
                if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Go back anyway?')) return;
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
                  {currentSubjects.map((sub) => (
                    <th key={sub.name} className="px-4 py-3 text-center text-xs">
                      {sub.name}<br />
                      <span className="text-gray-300">(Max: {sub.maxMarks})</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm bg-gray-800">Total</th>
                  <th className="px-4 py-3 text-center text-sm bg-gray-800">%</th>
                  <th className="px-4 py-3 text-center text-sm bg-gray-800">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {studentResults.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-center text-gray-500">No students found in this class.</td></tr>
                ) : (
                  studentResults.map((result) => {
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
                        {currentSubjects.map((sub) => (
                          <td key={sub.name} className="px-4 py-3">
                            <div className="flex flex-col gap-1 items-center">
                              <input
                                type="number"
                                min="0"
                                max={sub.maxMarks}
                                value={result.subjects[sub.name].obtained ?? ''}
                                onChange={(e) => handleMarksChange(result.studentId, sub.name, e.target.value)}
                                placeholder="0"
                                className="w-20 px-2 py-1 text-center border-2 border-gray-300 rounded focus:border-red-600 focus:outline-none text-sm"
                              />
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
                  })
                )}
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
            const absoluteMax = currentSubjects.reduce((acc, sub) => acc + sub.maxMarks, 0);

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
                        <td className="px-4 py-3 text-center text-sm">{absoluteMax}</td>
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
            <Button variant="outline" onClick={() => setReportCardIndex(Math.max(0, reportCardIndex - 1))} disabled={reportCardIndex === 0}>← Previous</Button>
            <span className="text-sm text-gray-600 self-center">{reportCardIndex + 1} / {selectedStudentsList.length}</span>
            <Button variant="outline" onClick={() => setReportCardIndex(Math.min(selectedStudentsList.length - 1, reportCardIndex + 1))} disabled={reportCardIndex === selectedStudentsList.length - 1}>Next →</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}