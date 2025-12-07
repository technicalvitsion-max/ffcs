import { ArrowRightIcon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import { Link } from "react-router-dom";

const MARKING_SCHEME = {
    pass_criteria: "90 Hours",
    event_contribution: [
        { activity: "Attending Official meetings (Offline)", hours: 2 },
        { activity: "Attending Events", hours: 2 },
        { activity: "Being part of Organizing Committee", hours: 3 },
    ],
    committee_contribution: {
        artistic: [
            { activity: "Acting in marketing reels", hours: 2 },
            { activity: "YouTube Vlogs/Insta Content", hours: 2 },
        ],
        content: [
            { activity: "Content ideas (Posts/Reels)", hours: 2 },
            { activity: "Taking MoM for meetings", hours: 2 },
        ],
        design: [{ activity: "Creating poster/insta post designs", hours: 4 }],
        editing: [
            { activity: "Promo edits", hours: 2 },
            { activity: "Marketing reel edits", hours: 2 },
            { activity: "Aftermovies", hours: 2 },
            { activity: "Fan Edits", hours: 2 },
        ],
        event_management: [
            { activity: "Pitching Event Ideas", hours: 2 },
            { activity: "Event coordinator", hours: 4 },
            { activity: "Other volunteering", hours: 2 },
        ],
        marketing: [
            { activity: "Desk Marketing", hours: "Duration based" },
            { activity: "Proposing Reel ideas", hours: 2 },
        ],
        photography: [
            { activity: "Event photographer", hours: 4 },
            { activity: "Reel shoot", hours: 2 },
        ],
        social_media: [
            { activity: "Content for weekly posts", hours: 2 },
            { activity: "Providing ideas for posts", hours: 2 },
        ],
    },
    creative_contributions: {
        project_type: "Short Film",
        requirements: ["Team of 10 max", "Minimum 5 mins long"],
        role_allocations: [
            { role: "Director", hours: 10 },
            { role: "Writer", hours: 6 },
            { role: "Cinematographer", hours: 8 },
            { role: "Editor", hours: 8 },
            { role: "Music", hours: 6 },
            { role: "Asst. Director", hours: 6 },
            { role: "Posters", hours: 4 },
            { role: "Lead Actors", hours: 8 },
            { role: "Supporting Actors", hours: 6 },
            { role: "Junior Artists", hours: 4 },
        ],
    },
};

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            {/* Hero Section */}
            <section className="pt-32 pb-10 px-4 md:px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#0a0a0a] rounded-[2.5rem] p-8 md:p-14 lg:p-20 text-white relative overflow-hidden shadow-2xl"
                    >
                        {/* Abstract blobs for subtle depth */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4"></div>

                        <div className="relative z-10 max-w-4xl">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-sm font-medium mb-10"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Official Hours Tracking Portal
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]"
                            >
                                FROM SCRIPT<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">
                                    TO SCREEN.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="mt-8 max-w-2xl text-xl md:text-2xl text-gray-400 leading-relaxed font-light"
                            >
                                VITSION is the premier filmmaking club. We visualize, we create, and
                                we inspire. Track your FFCS contribution hours seamlessly.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="mt-12 flex flex-wrap items-center gap-4"
                            >
                                <Link
                                    to="/login"
                                    className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
                                >
                                    Login
                                    <ArrowRightIcon className="w-5 h-5" />
                                </Link>
                                <a
                                    href="#scheme"
                                    className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-2"
                                >
                                    <PlayIcon className="w-5 h-5 text-gray-300" />
                                    Marking Scheme
                                </a>
                            </motion.div>
                        </div>

                        {/* Stats Pill */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="absolute bottom-10 right-10 hidden lg:block"
                        >
                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 w-64">
                                <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                                    Pass Criteria
                                </span>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-white">
                                        {MARKING_SCHEME.pass_criteria.split(" ")[0]}
                                    </span>
                                    <span className="text-lg text-gray-400 font-medium mb-1">Hours</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Marking Scheme Section */}
            <section id="scheme" className="py-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#0a0a0a] rounded-[2.5rem] p-8 md:p-16 lg:p-20 text-white relative overflow-hidden shadow-2xl">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/2"></div>

                        <div className="relative z-10">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                                    MARKING SCHEME
                                </h2>
                                <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">
                                    Choose your path to earn credits. Whether you're on screen, behind
                                    the camera, or managing the chaos.
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="flex justify-center mb-16">
                                <div className="bg-white/5 p-2 rounded-full inline-flex border border-white/10">
                                    {["general", "committees", "short film"].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all capitalize relative ${activeTab === tab
                                                ? "text-black"
                                                : "text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            {activeTab === tab && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-white rounded-full shadow-lg"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10">{tab}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="min-h-[500px]">
                                {/* GENERAL TAB */}
                                {activeTab === "general" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                    >
                                        {MARKING_SCHEME.event_contribution.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="group bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                                            >
                                                <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mb-6 font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                                                    {item.hours}h
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {item.activity}
                                                </h3>
                                                <p className="text-gray-500 font-medium text-sm">
                                                    General contribution
                                                </p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* COMMITTEES TAB */}
                                {activeTab === "committees" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {Object.entries(MARKING_SCHEME.committee_contribution).map(
                                            ([dept, activities]) => (
                                                <div
                                                    key={dept}
                                                    className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:border-white/20 transition-all duration-300"
                                                >
                                                    <div className="p-6 bg-white/5 border-b border-white/5">
                                                        <h3 className="text-xl font-bold text-white capitalize flex items-center gap-3">
                                                            <span className="w-2 h-2 rounded-full bg-white"></span>
                                                            {dept.replace("_", " ")}
                                                        </h3>
                                                    </div>
                                                    <div className="p-6 space-y-4">
                                                        {activities.map((act, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex justify-between items-center text-sm group/item"
                                                            >
                                                                <span className="text-gray-400 font-medium group-hover/item:text-white transition-colors">
                                                                    {act.activity}
                                                                </span>
                                                                <span className="px-3 py-1 bg-white/10 text-white rounded-lg font-bold border border-white/10">
                                                                    {act.hours}
                                                                    {typeof act.hours === "number" && "h"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </motion.div>
                                )}

                                {/* SHORT FILM TAB */}
                                {activeTab === "short film" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="max-w-5xl mx-auto"
                                    >
                                        <div className="bg-white/5 p-10 md:p-14 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                                            {/* Decorative blobs */}
                                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                                            <div className="relative z-10">
                                                <div className="text-center mb-14">
                                                    <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-4 block">
                                                        Production Requirements
                                                    </span>
                                                    <h3 className="text-4xl md:text-5xl font-black text-white mb-8">
                                                        The Short Film Project
                                                    </h3>
                                                    <div className="flex flex-wrap justify-center gap-3">
                                                        {MARKING_SCHEME.creative_contributions.requirements.map(
                                                            (req, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm"
                                                                >
                                                                    {req}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {MARKING_SCHEME.creative_contributions.role_allocations.map(
                                                        (role, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex justify-between items-center p-5 bg-black/20 rounded-2xl border border-white/5 hover:bg-black/40 transition-colors"
                                                            >
                                                                <span className="text-gray-300 font-medium text-lg">
                                                                    {role.role}
                                                                </span>
                                                                <span className="text-white font-black text-xl">
                                                                    {role.hours}
                                                                    <span className="text-xs text-gray-500 font-bold ml-1">
                                                                        HRS
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <div className="mt-14 text-center">
                                                    <p className="text-gray-500 text-xs font-bold tracking-[0.3em] uppercase">
                                                        Vitsion Productions • 2025
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Footer */}
            < footer className="py-10 px-4 md:px-6" >
                <div className="max-w-7xl mx-auto bg-black rounded-[3rem] py-16 text-white text-center shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="mb-2">
                            <img src="/vitsion-logo.png" alt="VITSION" className="h-12 w-auto mx-auto object-contain mix-blend-screen" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">VITSION FFCS</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        © {new Date().getFullYear()} VITSION Club. All rights reserved.{" "}
                        <br />
                        Built for the creative minds of tomorrow.
                    </p>
                </div>
            </footer >
        </div >
    );
}
