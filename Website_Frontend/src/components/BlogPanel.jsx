import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Search,
  Share2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Tag,
} from "lucide-react";

const BLOG_POSTS = [
  {
    id: "post-1",
    title:
      "PM Surya Ghar Yojana Subsidy in Rajkot (2026): Step-by-Step Guide for PGVCL Consumers",
    slug: "pm-surya-ghar-yojana-rajkot-subsidy-guide",
    category: "Subsidy",
    tags: ["Surya Ghar Yojana", "GEDA Subsidy", "PGVCL Online", "Rajkot Solar"],
    date: "June 12, 2026",
    author: "Rajesh Varma (Lead Solar Technical Architect)",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1200",
    summary:
      "Wondering how to get up to ₹78,000 subsidy on residential solar systems in Rajkot, Gujarat? Read our comprehensive 2026 step-by-step guide covering GEDA empanelment rules, portal application, and net-metering approval.",
    paragraphs: [
      "Under the PM Surya Ghar: Muft Bijli Yojana launched by the Central Government, residential houses in Rajkot can avail of substantial financial subsidies to set up grid-connected solar power systems. For system sizes up to 2 kW, a subsidy of ₹30,000 per kW is provided. For systems between 2 kW and 3 kW, an additional ₹18,000 per kW is granted. This caps the maximum central subsidy at a generous ₹78,000.",
      "To claim this seamless direct-benefit transfer (DBT), Rajkot homeowners must install systems only through a GEDA (Gujarat Energy Development Agency) empanelled vendor like Sunnovative Solar System Pvt Ltd. All hardware, including the photovoltaic modules, must comply strictly with the Domestic Content Requirement (DCR) parameters certified by the Ministry of New and Renewable Energy (MNRE).",
      "The step-by-step installation process is fully digitized. First, register on the National Portal (pmsuryaghar.gov.in) with your 11-digit PGVCL consumer number (located on your light bill). After submit, the local DISCOM, Paschim Gujarat Vij Company Limited, will carry out a technical feasibility analysis to authorize your request. Once approved, our engineers will install the DCR-approved panels, prepare the net-metering application, and coordinate with PGVCL inspectors for official meter testing. Your subsidy is directly credited to your submitted bank account within 30 days of standard commissioning!",
    ],
    keyTakeaways: [
      "1 kW to 2 kW systems receive ₹30,000/kW subsidy directly from the National Portal.",
      "3 kW and above systems get a locked maximum flat subsidy of ₹78,000.",
      "Only Domestic Content Requirement (DCR) approved solar cells are eligible under the central scheme.",
      "Compulsory net-metering setup must be done through GEDA empanelled EPC contractors.",
    ],
    faqs: [
      {
        q: "Can I apply for solar subsidy if I have a single-phase PGVCL light bill connection?",
        a: "Yes, systems up to 3 kW can be comfortably installed on a single-phase electricity connection. Beyond 3 kW, PGVCL guidelines mandate that your home load must be upgraded to a standard three-phase connection.",
      },
      {
        q: "How long does the GEDA government subsidy takes to credit in Rajkot?",
        a: "Once the final net-meter is loaded and the commissioning certificate is approved online on the national portal, the subsidy is credited to your bank account within 21 to 30 working days.",
      },
    ],
  },
  {
    id: "post-2",
    title:
      "How to Read Your PGVCL Light Bill to Calculate the Perfect Solar Panel Capacity",
    slug: "read-pgvcl-light-bill-solar-capacity",
    category: "Sizing",
    tags: [
      "PGVCL Bill",
      "Solar Sizing Calculator",
      "Electricity Tariff",
      "Saurashtra Grid",
    ],
    date: "May 28, 2026",
    author: "Kirit Patel (Senior EPC Project Manager)",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=1200",
    summary:
      "Do not overspend on high-load setups! Find out where your PGVCL sanctioned load, annual unit consumption, and monthly billing slabs are hidden, and size your solar system with maximum mathematical ROI.",
    paragraphs: [
      "A primary mistake among Gujarat property owners is requesting a random solar size (like a generic 5 kW or 10 kW) without mapping their actual PGVCL light bill metrics. Sizing a system too large results in unutilized generation that is sold back to PGVCL at a lower feed-in rate of ₹2.25/unit, whereas sizing too small means you continue to pay higher slab rates to the utility.",
      'To calculate the perfect capacity, look at the "Sanctioned Load" (shown in kW or HP) on the top margin of your latest PGVCL bill. Your solar panel system load capacity cannot exceed this sanctioned load under general DISCOM rules without formally paying for a load expansion request. Next, review your bimonthly or monthly unit consumption (marked as "Units Consumed" or "KWH").',
      "In Rajkot, a typical household consuming around 360 units per month requires a 3 kW solar power system. As a golden metric, 1 kW of solar capacity in Saurashtra averages about 4.3 units of electricity per day (120 to 130 units per month). By dividing your monthly bill unit target by 125, you can instantly determine the exact kW size required to erase your electricity bill completely!",
    ],
    keyTakeaways: [
      "Always refer to the Sanctioned Load (expressed in kW) on the PGVCL utility invoice.",
      "1 kW of premium monocrystalline solar panels generates ~4.3 electricity units in Rajkot weather.",
      "Check if your house consumes above 300 units monthly to maximize the value from GEDA solar arrays.",
      "Exporting excess units back to PGVCL pays you ₹2.25 per unit under current Net Metering policy.",
    ],
    faqs: [
      {
        q: "What if my solar system generation exceeds my home consumption?",
        a: "The excess energy goes into the PGVCL grid via net-metering. At the end of the financial year, PGVCL calculates your total surplus and directly pays you at the rate of ₹2.25 per unit.",
      },
      {
        q: "How do I request a sanctioned load expansion from PGVCL?",
        a: "You can apply for load expansion directly via the PGVCL consumer portal or let Sunnovative team handle the documentation alongside your solar file.",
      },
    ],
  },
  {
    id: "post-3",
    title:
      "Tata Solar vs. Waaree vs. Adani: Best Compulsory DCR Panels & Pricing in Rajkot",
    slug: "tata-waaree-adani-solar-panels-price-rajkot",
    category: "Brands",
    tags: ["Tata Solar Price", "Waaree Solar", "Adani Green", "DCR vs Non-DCR"],
    date: "June 4, 1926",
    author: "Amit Shah (Director of Procurement & Supply Chain)",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=1200",
    summary:
      "Domestic Content Requirement (DCR) solar panels are mandatory to claim the PM Surya Ghar Yojana subsidy. We compile an honest comparison of India’s tier-1 brands, their cell tech, and prices.",
    paragraphs: [
      "To claim your central subsidy under the PM Surya Ghar scheme, MNRE has made DCR (Domestic Content Requirement) panels strictly compulsory. DCR panels are those where both the solar cells and the solar modules are physically manufactured within Indian borders. Imported modules, even if highly efficient, do not qualify for any financial government support.",
      "Three brands dominate the Rajkot market: Tata Power Solar, Waaree Energies, and Adani Solar. Tata is highly favored for its exceptional legacy and massive warranty framework. Waaree is a market leader in high-efficiency Bifacial and Monocrystalline panels (often exceeding 540 Wp). Adani Solar stands out with its premium Mono-PERC arrays that deliver outstanding performance in high-temperature landscapes like Saurashtra.",
      "When reviewing prices, DCR panels are slightly priced higher than standard non-DCR panels because of local manufacturing constraints. Currently, in Rajkot, a complete 3 kW turnkey DCR solar package (including panels, high-efficiency grid-tied inverter, hot-dip galvanized mounting structures, and net-metering commissioning) costs roughly ₹1,55,000 to ₹1,65,000. After subtracting the assured target subsidy of ₹78,000, your final investment is just around ₹77,000 to ₹87,000!",
    ],
    keyTakeaways: [
      "DCR panels are non-negotiable for PM Surya Ghar Yojana central subsidy approvals.",
      "Tata Power Solar offers ultimate long-term reliability but has a small price premium.",
      "Waaree and Adani modules provide highly optimized wattage configurations up to 550Wp.",
      "Mono-PERC technology performs vastly better in the harsh Summer heat of Rajkot than older Poly panels.",
    ],
    faqs: [
      {
        q: "Are non-DCR panels bad? Why do people buy them?",
        a: "Non-DCR panels are highly efficient but are used mainly in industrial or commercial installations where government subsidy is not applicable, allowing developers to import cheaper modules.",
      },
      {
        q: "What is the degradation rate of Monocrystalline DCR panels?",
        a: "Standard tier-1 panels like Waaree or Tata specify a 25-year performance warranty, promising 80% to 84% of original capacity extraction even at year 25.",
      },
    ],
  },
];

export default function BlogPanel({ onBackToHome, onScrollToForm }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedLink, setCopiedLink] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});

  // Reset selected post view if category filters are changed from header
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedPost(null);
  };

  const handleShare = (slug) => {
    const url = `${window.location.origin}${window.location.pathname}#blog/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLike = (id, e) => {
    e.stopPropagation();
    setLikedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter logic
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Automatically scroll to top on open or page turn
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedPost]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-16 font-sans">
      {/* Blog Hero Banner */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-900 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0081C9]/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/25 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 fill-sky-500/20" /> SEO Solar
            Insights Portal
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-none mb-4">
            Rajkot Solar Wisdom &{" "}
            <span className="text-solar-yellow">GEDA Subsidy Blogs</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            High-ranking technical insights to answer all your PGVCL light bill
            calculations, PM Surya Ghar Yojana registrations, and Tata / Waaree
            solar brand comparison queries.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-solar-yellow transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back To Interactive
              Calculator
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Main interactive grid structure */}
        {selectedPost ? (
          /* DETAILED ARTICLE VIEW - "Another Page" Layout */
          <div
            className="animate-fadeIn min-h-[600px]"
            id="single-blog-article"
          >
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-900 mb-8">
              <button
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0081C9] hover:text-sky-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Blog Directory
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10.5px] font-bold">
                  Category:{" "}
                  <strong className="text-white">
                    {selectedPost.category}
                  </strong>
                </span>

                <button
                  onClick={() => handleShare(selectedPost.slug)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white transition px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />{" "}
                  {copiedLink ? "Copied Link!" : "Share Article"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left major column - Content details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Meta details */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-4 h-4 text-[#0081C9]" />{" "}
                      {selectedPost.date}
                    </span>
                    <span className="text-slate-800">•</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-4 h-4 text-[#0081C9]" />{" "}
                      {selectedPost.readTime}
                    </span>
                    <span className="text-slate-800">•</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <User className="w-4 h-4 text-[#0081C9]" />{" "}
                      {selectedPost.author}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight font-display tracking-tight text-balance">
                    {selectedPost.title}
                  </h2>
                </div>

                {/* Big Display Image */}
                <div className="h-64 sm:h-96 rounded-3xl overflow-hidden border border-slate-850 relative group">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                </div>

                {/* Article body paragraphs */}
                <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {selectedPost.paragraphs.map((para, idx) => (
                    <p key={idx} className="indent-0">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Structured Key Takeaways list */}
                <div className="bg-slate-900/60 border border-[#0081C9]/20 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Zap className="w-4.5 h-4.5 text-solar-yellow fill-solar-yellow/20" />
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      Key GEDA Solar Takeaways
                    </h3>
                  </div>
                  <ul className="grid grid-cols-1 gap-3 text-xs sm:text-sm text-slate-350">
                    {selectedPost.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FAQs Container inside the blog post */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {selectedPost.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-2"
                      >
                        <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-start gap-2 text-solar-yellow">
                          <span>Q:</span> {faq.q}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 leading-normal pl-5">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO Keywords Tag deck */}
                <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> SEO Tags:
                  </span>
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-900 text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-lg border border-slate-850"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right column - Sidebar layout */}
              <div className="space-y-8">
                {/* Author badge box */}
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0081C9]/20 border border-[#0081C9]/30 text-[#0081C9] flex items-center justify-center font-extrabold mx-auto text-xl">
                    SS
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm">
                      Sunnovative Solar Desk
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Rajkot Empanelled Solar Experts
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Helping homeowners secure full state and central solar
                    subsidies directly in their bank accounts with certified
                    tier-1 standards.
                  </p>
                </div>

                {/* Direct Action Quote Promo CTA */}
                <div className="bg-gradient-to-r from-[#0081C9]/20 to-indigo-950/40 border border-[#0081C9]/30 p-6 rounded-3xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl"></div>

                  <div className="space-y-1.5 relative z-10">
                    <span className="text-[9.5px] bg-solar-yellow text-slate-950 font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                      Calculate Now
                    </span>
                    <h4 className="font-display font-black text-white text-base lg:text-lg leading-tight pt-2">
                      Check Your Exact GEDA Solar Subsidy
                    </h4>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Avail up to ₹78,000 direct subsidy. Enter your PGVCL light
                      bill average value to see the perfect capacity instantly.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      onScrollToForm();
                    }}
                    className="w-full bg-[#0081C9] hover:bg-[#006FAD] text-white text-xs font-black uppercase py-3.5 rounded-xl text-center cursor-pointer transition shadow-md shadow-[#0081C9]/20"
                  >
                    Calculate Subsidy
                  </button>
                </div>

                {/* Other popular solar guides */}
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-slate-900 pb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-solar-yellow" />{" "}
                    Recommended Solar Guides
                  </h4>

                  <div className="divide-y divide-slate-900 space-y-4">
                    {BLOG_POSTS.filter(
                      (post) => post.id !== selectedPost.id,
                    ).map((pop) => (
                      <div
                        key={pop.id}
                        onClick={() => setSelectedPost(pop)}
                        className="pt-4 first:pt-0 group cursor-pointer space-y-2 block"
                      >
                        <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-850 uppercase font-black">
                          {pop.category}
                        </span>

                        <h5 className="font-bold text-xs text-slate-300 group-hover:text-solar-yellow transition-colors leading-snug">
                          {pop.title}
                        </h5>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{pop.date}</span>
                          <span>•</span>
                          <span>{pop.readTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* GENERAL DIRECTORY LISTING VIEW */
          <div className="space-y-10">
            {/* Top filters bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
              {/* Category selector pills */}
              <div className="flex flex-wrap gap-2">
                {["All", "Subsidy", "Technical", "Brands", "Sizing"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-[#0081C9] text-white shadow"
                          : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ),
                )}
              </div>

              {/* Live search input box */}
              <div className="relative w-full md:max-w-xs shrink-0 bg-slate-950 rounded-xl border border-slate-850 overflow-hidden focus-within:border-sky-500 transition-colors">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search solar guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Empty stats screen if filtered list is empty */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-850 space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-400">
                  Mujhe aapke search keyword ke solar content nahi mile.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Clear Filters & Reset
                </button>
              </div>
            ) : (
              /* Listing card grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => {
                  const isLiked = likedPosts[post.id] || false;

                  return (
                    <article
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="bg-slate-900/70 hover:bg-slate-900 rounded-[24px] overflow-hidden border border-slate-850 hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full relative cursor-pointer"
                    >
                      {/* Image header banner */}
                      <div className="h-52 bg-slate-950 relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                        {/* Category badge overlay */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#0081C9] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Card Content parameters */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          {/* Mini metrics bar */}
                          <div className="flex items-center gap-2.5 text-[10.5px] text-slate-500 font-semibold uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {post.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {post.readTime}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-white text-base lg:text-lg leading-snug group-hover:text-solar-yellow transition-colors duration-200">
                            {post.title}
                          </h3>

                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {post.summary}
                          </p>
                        </div>

                        {/* Bottom action bar */}
                        <div className="pt-4 border-t border-slate-950/60 flex items-center justify-between">
                          <span className="text-[#0081C9] group-hover:text-sky-400 transition-colors text-xs font-black uppercase tracking-wider flex items-center gap-1">
                            Read Full Guide{" "}
                            <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleLike(post.id, e)}
                            className={`p-2 rounded-lg border transition ${
                              isLiked
                                ? "bg-solar-yellow/10 border-solar-yellow text-solar-yellow"
                                : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-500 hover:text-slate-350"
                            }`}
                          >
                            <ThumbsUp
                              className={`w-3.5 h-3.5 ${isLiked ? "fill-solar-yellow" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Bottom Section: PM Surya Ghar call-out block */}
            <div className="p-6 sm:p-10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-slate-950 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 mt-16">
              <div className="space-y-2 max-w-xl md:text-left text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />{" "}
                  Authorized GEDA Solar Advisory
                </div>
                <h3 className="font-display font-black text-white text-lg sm:text-2xl leading-tight">
                  Saurashtra ka trusted rooftop installation vendor
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  PM Surya Ghar Yojana ke rules dynamic hain. GEDA registry
                  vendor, PGVCL light bill unit slabs aur actual standard
                  Mono-PERC arrays select karein. Sunnovative solar system
                  experts are 24/7 available in Rajkot hub!
                </p>
              </div>

              <div className="flex gap-4 shrink-0 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={onScrollToForm}
                  className="bg-[#0081C9] hover:bg-[#006FAD] text-white text-xs font-black uppercase px-6 py-3.5 rounded-xl cursor-pointer shadow-lg shadow-[#0081C9]/20"
                >
                  Verify Bill Subsidy
                </button>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-6 py-3.5 rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  Configure e-Shop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
