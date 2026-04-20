// pages/Profile.jsx
import React, { useState } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { courses as initialCourses } from "../data/courses";
import { 
  ArrowLeft, BookOpen, CheckCircle2, 
  Sparkles, Users, Trash2 
} from "lucide-react";

const MAX_ENROLLMENTS = 3;
const COURSE_CAPACITY = 50;

const getTheme = (cat) => {
  const themes = {
    'CS': { 
      primary: 'bg-indigo-600', 
      gradient: 'from-indigo-600 to-violet-700',
      soft: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      border: 'border-indigo-100',
      icon: <Sparkles className="w-6 h-6" />
    },
    'Finance': { 
      primary: 'bg-emerald-600', 
      gradient: 'from-emerald-600 to-teal-700',
      soft: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      border: 'border-emerald-100',
      icon: <BookOpen className="w-6 h-6" />
    },
    'Default': { 
      primary: 'bg-slate-800', 
      gradient: 'from-slate-700 to-slate-900',
      soft: 'bg-slate-50', 
      text: 'text-slate-800', 
      border: 'border-slate-100',
      icon: <BookOpen className="w-6 h-6" />
    }
  };
  return themes[cat] || themes['Default'];
};

function Profile() {
  const { user, isLoaded } = useUser();
  const [enrolled, setEnrolled] = useState([]);
  const [courseList, setCourseList] = useState(initialCourses);
  const [activeCourse, setActiveCourse] = useState(null);

  // Focus only on the Username or First Name
  const username = user?.username || user?.firstName || "Student";

  const enroll = (course) => {
    if (enrolled.length >= MAX_ENROLLMENTS) return alert("Limit of 3 courses reached!");
    if (enrolled.find((c) => c.id === course.id)) return alert("Already enrolled!");
    
    const target = courseList.find(c => c.id === course.id);
    if (target.enrolledCount >= COURSE_CAPACITY) return alert("Course is full!");

    setEnrolled([...enrolled, course]);
    setCourseList(courseList.map(c => 
      c.id === course.id ? { ...c, enrolledCount: (c.enrolledCount || 0) + 1 } : c
    ));
  };

  const drop = (id) => {
    if (window.confirm("Remove this course?")) {
      setEnrolled(enrolled.filter((c) => c.id !== id));
      setCourseList(courseList.map(c => 
        c.id === id ? { ...c, enrolledCount: Math.max(0, (c.enrolledCount || 0) - 1) } : c
      ));
    }
  };

  if (activeCourse) {
    const theme = getTheme(activeCourse.category);
    return (
      <div className="min-h-screen bg-white animate-in fade-in duration-500">
        <div className={`h-64 bg-gradient-to-r ${theme.gradient} flex items-end p-8 relative`}>
          <button 
            onClick={() => setActiveCourse(null)} 
            className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/20"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-md">{activeCourse.name}</h1>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 -mt-12">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h2 className={`text-2xl font-black mb-4 ${theme.text}`}>Course Overview</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Experience a deep-dive into {activeCourse.name}. This module covers foundational 
                principles and advanced applications used in the {activeCourse.category} industry.
              </p>
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <p className="text-4xl font-black mb-1">{COURSE_CAPACITY - (activeCourse.enrolledCount || 0)}</p>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-6 text-emerald-400">Available Seats</p>
              <button 
                onClick={() => { enroll(activeCourse); setActiveCourse(null); }}
                disabled={enrolled.find(c => c.id === activeCourse.id)}
                className={`w-full py-4 rounded-2xl font-black transition-all ${
                  enrolled.find(c => c.id === activeCourse.id) 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                {enrolled.find(c => c.id === activeCourse.id) ? "ENROLLED" : "JOIN COURSE"}
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans">
      {/* MINIMAL NAV WITH USERNAME */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Welcome Back</span>
            <span className="text-xl font-black text-slate-900 leading-none">
              {isLoaded ? username : "Loading..."}
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SCHEDULE SIDEBAR */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Your Path</h3>
            <div className="space-y-3">
              {enrolled.length === 0 ? (
                <p className="text-slate-300 text-sm italic">Add a course...</p>
              ) : (
                enrolled.map(c => {
                  const theme = getTheme(c.category);
                  return (
                    <div key={c.id} className={`${theme.soft} p-4 rounded-xl flex justify-between items-center animate-in slide-in-from-left-2`}>
                      <div className="flex items-center gap-2 truncate">
                        <div className={theme.text}>{theme.icon}</div>
                        <p className={`font-black text-[10px] truncate uppercase ${theme.text}`}>{c.name}</p>
                      </div>
                      <button onClick={() => drop(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">Slots used</span>
                <span className="text-2xl font-black text-slate-900">{enrolled.length}/3</span>
            </div>
          </div>
        </aside>

        {/* CATALOG */}
        <section className="lg:col-span-9">
          <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter italic">COURSE CATALOG</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courseList.map((course) => {
              const theme = getTheme(course.category);
              const isEnrolled = enrolled.find(c => c.id === course.id);
              const seatsLeft = COURSE_CAPACITY - (course.enrolledCount || 0);

              return (
                <div key={course.id} className="bg-white rounded-[2.5rem] p-4 border border-slate-200 transition-all hover:shadow-2xl flex flex-col group">
                  <div className={`h-40 rounded-[2rem] mb-6 flex items-center justify-center bg-gradient-to-br ${theme.gradient} text-white relative overflow-hidden`}>
                    <div className="text-5xl group-hover:scale-110 transition-transform">{theme.icon}</div>
                    <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black text-white">
                      {seatsLeft} LEFT
                    </div>
                  </div>

                  <div className="px-2 flex-grow flex flex-col">
                    <h4 className="text-lg font-black text-slate-800 mb-4 leading-tight uppercase">{course.name}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button 
                        onClick={() => setActiveCourse(course)}
                        className="py-3 rounded-xl bg-slate-50 text-slate-500 font-bold text-[10px] uppercase hover:bg-slate-100 transition-all"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => enroll(course)}
                        disabled={isEnrolled || seatsLeft <= 0}
                        className={`py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                          isEnrolled ? 'bg-slate-100 text-slate-300 shadow-none' : `${theme.primary} text-white shadow-lg`
                        }`}
                      >
                        {isEnrolled ? 'Active' : 'Enroll'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;

// // pages/Profile.jsx
// import { useUser, UserButton } from "@clerk/clerk-react";
// import { useState } from "react";
// import { courses } from "../data/courses";

// const MAX_COURSES = 3;

// function Profile() {
//   const { user } = useUser();
//   const [enrolled, setEnrolled] = useState([]);

//   const enrollCourse = (course) => {
//     if (enrolled.length >= MAX_COURSES) {
//       alert("You reached max course limit!");
//       return;
//     }

//     if (enrolled.find((c) => c.id === course.id)) {
//       alert("Already enrolled!");
//       return;
//     }

//     setEnrolled([...enrolled, course]);
//   };

//   const dropCourse = (id) => {
//     setEnrolled(enrolled.filter((c) => c.id !== id));
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl shadow-sm mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">
//             Welcome, {user?.firstName || "Student"} 👋
//           </h2>
//           <p className="text-gray-500 mt-1">Manage your academic schedule</p>
//         </div>
//         <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full w-fit">
//           <span className="text-sm font-medium text-gray-600">Account:</span>
//           <UserButton />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Enrolled Courses Sidebar */}
//         <div className="lg:col-span-1">
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 sticky top-8">
//             <h3 className="text-xl font-semibold mb-4 flex justify-between items-center">
//               Enrolled Courses
//               <span className={`text-sm px-3 py-1 rounded-full ${enrolled.length >= MAX_COURSES ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
//                 {enrolled.length}/{MAX_COURSES}
//               </span>
//             </h3>
            
//             {enrolled.length === 0 ? (
//               <p className="text-gray-400 italic py-4 text-center border-2 border-dashed border-gray-100 rounded-lg">
//                 No courses enrolled yet.
//               </p>
//             ) : (
//               <ul className="space-y-3">
//                 {enrolled.map((course) => (
//                   <li key={course.id} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
//                     <span className="font-medium text-gray-800">{course.name}</span>
//                     <div className="flex justify-between items-center mt-2">
//                       <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{course.category}</span>
//                       <button 
//                         onClick={() => dropCourse(course.id)}
//                         className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
//                       >
//                         Drop Course
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>

//         {/* Available Courses Main Section */}
//         <div className="lg:col-span-2 space-y-8">
//           <section>
//             <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
//               <span className="p-1 bg-indigo-100 rounded">💻</span> Computer Science
//             </h4>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {courses
//                 .filter((c) => c.category === "CS")
//                 .map((course) => (
//                   <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-indigo-300 transition-colors">
//                     <span className="font-medium text-gray-700">{course.name}</span>
//                     <button 
//                       onClick={() => enrollCourse(course)}
//                       className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-md active:scale-95"
//                     >
//                       Enroll
//                     </button>
//                   </div>
//                 ))}
//             </div>
//           </section>

//           <section>
//             <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
//               <span className="p-1 bg-green-100 rounded">💰</span> Finance & Business
//             </h4>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {courses
//                 .filter((c) => c.category === "Finance")
//                 .map((course) => (
//                   <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-green-300 transition-colors">
//                     <span className="font-medium text-gray-700">{course.name}</span>
//                     <button 
//                       onClick={() => enrollCourse(course)}
//                       className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-md active:scale-95"
//                     >
//                       Enroll
//                     </button>
//                   </div>
//                 ))}
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Profile;