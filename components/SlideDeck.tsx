
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Circle, Disc, Share2, Layers, Download, Cpu, Microscope, BrainCircuit, List, ArrowRight } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';
import { SlideType, SlideData } from '../types';

// Backgrounds
import NetworkBackground from './backgrounds/NetworkBackground';
import OrbitBackground from './backgrounds/OrbitBackground';
import WarpGridBackground from './backgrounds/WarpGridBackground';
import QuantumParticlesBackground from './backgrounds/QuantumParticlesBackground';
import CrystalBackground from './backgrounds/CrystalBackground';

// --- DATA SOURCE ---
const slides: SlideData[] = [
  // 1. COVER
  {
    id: SlideType.COVER,
    title: "自然观、科学认识方法与科学认识",
    subtitle: "从牛顿、爱因斯坦、哥本哈根学派到安德森",
    description: "探究人类自然观、科学方法与科学知识之间深刻的辩证演化关系。",
    person: "董玉豪 自然辩证法第三组（63-93）"
  },
  // 2. TOC
  {
    id: SlideType.TOC,
    title: "目录",
    subtitle: "TABLE OF CONTENTS",
    details: [
      { label: "01", value: "引言：核心范畴定义" },
      { label: "02", value: "牛顿：机械决定论的宇宙" },
      { label: "03", value: "爱因斯坦：几何与相对论" },
      { label: "04", value: "哥本哈根学派：概率与不确定性" },
      { label: "05", value: "菲利普·安德森：涌现与复杂性" },
      { label: "06", value: "总结：演进螺旋" }
    ]
  },
  // 3. INTRO - CONCEPTS
  {
    id: SlideType.CONCEPTS,
    title: "核心范畴定义",
    subtitle: "INTRODUCTION",
    description: "理解科学活动的三大维度：本体论、方法论与认识论。"
  },
  
  // --- NEWTON SECTION ---
  {
    id: SlideType.NEWTON,
    title: "牛顿：机械自然观",
    subtitle: "NEWTONIAN WORLDVIEW",
    person: "Isaac Newton (1643–1727)",
    details: [
      { label: "机械论", value: "整个宇宙及其万物都像一台由上帝创造并上好发条的钟表，按照严格的、确定的力学规律运行。" },
      { label: "绝对时空观", value: "时间和空间是绝对的、均匀流逝的、与物质及其运动无关的独立背景和舞台。" },
      { label: "因果决定论", value: "一切运动都有确定的原因和结果。知晓初始状态和规律即可预测未来（拉普拉斯妖）。" },
      { label: "还原论 & 原子论", value: "复杂的整体可还原为简单的部分；万物本质上由坚硬不可毁灭的粒子组成。" }
    ]
  },
  {
    id: SlideType.NEWTON,
    title: "牛顿：科学认识方法",
    subtitle: "NEWTONIAN METHODOLOGY",
    person: "“Hypotheses non fingo”",
    details: [
      { label: "公理演绎与数学推导", value: "模仿欧几里得，建立公理系统。以三大定律为公理，通过微积分推导万物规律。" },
      { label: "分析与综合", value: [
        "分析：从复杂现象中推导出普遍原理（从结果到原因）。",
        "综合：从普遍原理推演并解释广泛现象（从原因到结果）。"
      ]},
      { label: "我不杜撰假说", value: "主张通过观察和实验描述现象背后的数学规律（How），而非臆测不可验证的形而上原因（Why）。" },
      { label: "数学与实验验证", value: "理论必须回归物理世界，通过实验观测验证，理论的正确性取决于与数据的精确符合。" }
    ]
  },
  {
    id: SlideType.NEWTON,
    title: "牛顿：科学认识与总结",
    subtitle: "KNOWLEDGE & SUMMARY",
    person: "经典力学体系",
    details: [
      { label: "主要成就", value: [
        "经典力学体系：惯性定律、F=ma、作用力与反作用力。",
        "万有引力定律：天地大一统，力与质量成正比，与距离平方成反比。",
        "光学：揭示光的色散（七色光）与微粒说。"
      ]},
      { label: "演化闭环", value: [
        "自然观 → 方法：因为视宇宙为机器，所以采用拆解分析法。",
        "方法 → 认识：通过严谨分析与推导，建立了宏伟的力学定律。",
        "认识 → 自然观：力学的巨大成功（如预测海王星）反过来强化了机械决定论的信念。"
      ]}
    ]
  },

  // --- EINSTEIN SECTION ---
  {
    id: SlideType.EINSTEIN,
    title: "爱因斯坦：自然观",
    subtitle: "EINSTEIN'S WORLDVIEW",
    person: "Albert Einstein (1879–1955)",
    details: [
      { label: "统一性与协变性", value: "自然法则必须普适。无论观察者运动状态如何，物理定律形式应保持不变（协变性）。" },
      { label: "因果决定论", value: "“上帝不掷骰子”。宇宙有严格逻辑秩序，不存在纯粹偶然，遵循严格因果律（斯宾诺莎的神）。" },
      { label: "逻辑简单性", value: "自然深层规律在数学上是简单优美的。逻辑冗余的理论往往是错误的。" },
      { label: "马赫的关系论", value: "没有物质就没有空间。时空不能独立存在，必须依附于物质及其运动关系。" }
    ]
  },
  {
    id: SlideType.EINSTEIN,
    title: "爱因斯坦：方法论",
    subtitle: "METHODOLOGY OF RELATIVITY",
    person: "思维的飞跃",
    details: [
      { label: "思想实验", value: "在思维中构建理想模型（如追光实验、升降机），逻辑推演以检验前提、发现矛盾。" },
      { label: "原理演绎", value: "从少数普遍性基本假设（如光速不变）出发，演绎构建完整理论体系。" },
      { label: "概念批判", value: "对“同时性”、“时间”等被视为不言自明的基本概念进行批判性分析。" },
      { label: "逻辑简单性", value: "以理论前提的简洁性作为评价核心标准。" }
    ]
  },
  {
    id: SlideType.EINSTEIN,
    title: "爱因斯坦：认识与新自然观",
    subtitle: "NEW REALITY",
    person: "时空革命",
    details: [
      { label: "相对论时空观", value: "否定绝对时空。时间间隔与空间长度取决于观测者。三维空间+一维时间=四维时空。" },
      { label: "引力几何化", value: "引力不是超距力，而是物质与能量导致的“时空弯曲”。物质告诉时空如何弯曲，时空告诉物质如何运动。" },
      { label: "质能关系 & 光量子", value: "E=mc² 揭示质量与能量的统一；光量子论揭示光的波粒二象性。" },
      { label: "新自然观总结", value: "从牛顿的“刚性容器”转变为动态的、与物质不可分割的“几何场”。" }
    ]
  },

  // --- QUANTUM SECTION ---
  {
    id: SlideType.QUANTUM,
    title: "哥本哈根：变革前夜",
    subtitle: "THE QUANTUM CRISIS",
    person: "经典物理的乌云",
    details: [
      { label: "紫外灾难", value: "经典理论预言黑体辐射高频能量无穷大，意味着能量连续观念在原子尺度失效。" },
      { label: "光电效应", value: "光的能量取决于频率而非强度，暗示光以离散“量子”形式传递。" },
      { label: "原子光谱", value: "原子的分立线状谱与经典电磁理论（预言原子坍缩）完全矛盾。" },
      { label: "电子衍射", value: "实物粒子（电子）穿过晶体产生衍射，证明粒子也具有波动性。" }
    ]
  },
  {
    id: SlideType.QUANTUM,
    title: "哥本哈根：方法论",
    subtitle: "COPENHAGEN SPIRIT",
    person: "Bohr, Heisenberg, Born",
    details: [
      { label: "唯象实证", value: "摒弃不可观测的直观图像（如电子轨道），只构建连接可观测量的数学形式体系。" },
      { label: "概率诠释", value: "物理学从因果确定性描述转变为系统状态的统计概率性描述。" },
      { label: "对应原理", value: "新理论在宏观极限下必须渐进回归到经典物理规律。" },
      { label: "互补逻辑", value: "互斥的经典概念（如波与粒）是描述同一现象互补的侧面，共存才能完整描述。" }
    ]
  },
  {
    id: SlideType.QUANTUM,
    title: "哥本哈根：认识与新自然观",
    subtitle: "PROBABILISTIC UNIVERSE",
    person: "上帝掷骰子吗？",
    details: [
      { label: "核心发现", value: [
        "不确定性原理：位置与动量精度存在极限。",
        "波函数坍缩：观测行为导致概率云坍缩为确定态。",
        "态叠加原理：测量前系统处于所有可能状态的叠加。"
      ]},
      { label: "自然观剧变", value: [
        "概率即根本：微观规律本质是概率性的。",
        "现象即实在：没有独立于观测的“客观实在”，观测创造现实。",
        "互补性：自然拒绝被单一的经典图像完整描绘。"
      ]}
    ]
  },

  // --- ANDERSON SECTION ---
  {
    id: SlideType.ANDERSON,
    title: "安德森：复杂性的挑战",
    subtitle: "MORE IS DIFFERENT",
    person: "P.W. Anderson (1923–2020)",
    details: [
      { label: "宏观量子现象", value: "超导与超流展示了无法通过简单叠加微观粒子性质解释的宏观集体行为。" },
      { label: "对称性破缺事实", value: "微观定律完全对称，但宏观物质（磁铁、晶体）却自发选择特定方向，丧失对称性。" },
      { label: "多体计算灾难", value: "面对10²³个粒子，直接演算薛定谔方程在数学上不可解，还原论在实践中失效。" },
      { label: "临界普适性", value: "完全不同的物理系统（液气、铁磁）在临界点遵循完全相同的幂律，暗示存在高层级法则。" }
    ]
  },
  {
    id: SlideType.ANDERSON,
    title: "安德森：涌现自然观",
    subtitle: "PHILOSOPHY OF EMERGENCE",
    person: "层级论",
    details: [
      { label: "层级涌现", value: "整体不等于部分之和。量的积累引发质变，涌现出微观层面不存在的全新性质。" },
      { label: "反构建主义", value: "承认还原论（分解），但否定构建论。高层规律无法被低层定律简单推导。" },
      { label: "对称性破缺机制", value: "物质产生结构、有序态的根本原因在于系统原有对称性的自发丧失。" },
      { label: "定律层级性", value: "每个层级（粒子、化学、生物）都有其自身独立的、基础的有效定律。" }
    ]
  },
  {
    id: SlideType.ANDERSON,
    title: "安德森：方法与认识",
    subtitle: "COMPLEXITY TOOLKIT",
    person: "驯服复杂性",
    details: [
      { label: "新方法论", value: [
        "模型哈密顿量：舍弃细节，构建简化抽象模型捕捉核心机制。",
        "准粒子近似：将复杂集体运动等效为弱相互作用的独立实体。",
        "有效场论：忽略高能细节（粗粒化），专注于宏观能标下的有效理论。"
      ]},
      { label: "主要认识", value: [
        "安德森局域化：无序可导致波函数锁定，金属变绝缘体。",
        "希格斯机制：规范对称性破缺赋予粒子质量。",
        "普适类：宏观规律独立于微观细节。"
      ]}
    ]
  },

  // --- SUMMARY & ENDING ---
  {
    id: SlideType.SUMMARY,
    title: "演进螺旋",
    subtitle: "THE EVOLUTIONARY SPIRAL",
    description: "科学不仅是知识的积累，更是世界观的不断重塑。"
  },
  {
    id: SlideType.ENDING,
    title: "致谢与交流",
    subtitle: "Q & A",
    description: "科学探索永无止境"
  }
];

const SlideDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Keyboard navigation
  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [currentSlide, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [currentSlide, isTransitioning]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // PPT Generation
  const generatePPTX = async () => {
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';
    pres.author = 'AI Science Assistant';
    pres.title = slides[0].title;
    
    // Define Color Palette
    const colors = {
      bg: "020C1B",       // navy-950/900 mix
      bgGradient: "0A192F",
      cardBg: "112240",   // navy-700
      accent: "64FFDA",   // cyan/teal
      textMain: "CCD6F6", // slate-light
      textDim: "8892B0",  // slate-dim
      white: "FFFFFF",
      border: "233554"
    };

    // Standard styling configs
    const fontMain = "Microsoft YaHei"; // Fallback for Chinese
    const fontMono = "Consolas";

    slides.forEach((slide) => {
      const pptxSlide = pres.addSlide();
      
      // 1. Background: Dark Navy Solid
      pptxSlide.background = { color: colors.bg };
      
      // 2. Subtle Background Decor (Simulating the canvas feel)
      // Add a very large, faint gradient circle in the corner
      pptxSlide.addShape(pres.ShapeType.ellipse, {
          x: 9, y: -2, w: 10, h: 10,
          fill: { color: colors.bgGradient, transparency: 80 },
          line: { color: "FFFFFF", width: 0, transparency: 100 }
      });
      // Add grid lines (WarpGrid simulation) if it's a technical slide
      if (slide.id === SlideType.NEWTON || slide.id === SlideType.EINSTEIN || slide.id === SlideType.QUANTUM) {
         pptxSlide.addShape(pres.ShapeType.line, { x: 0, y: 1.5, w: 10, h: 0, line: { color: colors.border, width: 0.5, dashType: 'dash' } });
         pptxSlide.addShape(pres.ShapeType.line, { x: 0, y: 6.5, w: 10, h: 0, line: { color: colors.border, width: 0.5, dashType: 'dash' } });
      }

      // 3. Footer
      pptxSlide.addText(`${slide.id}  |  ${slide.subtitle}`, { 
          x: 0.3, y: 7.2, w: "50%", fontSize: 9, color: "303C55", fontFace: fontMono 
      });
      pptxSlide.addText("AI SCIENCE DECK", { 
          x: 8, y: 7.2, w: "18%", align: "right", fontSize: 9, color: "303C55", fontFace: fontMono 
      });

      // --- SPECIFIC SLIDE LAYOUTS ---

      if (slide.id === SlideType.COVER) {
        // Centered Layout
        pptxSlide.addText("SCIENTIFIC EVOLUTION", { 
            x: 0, y: 1.5, w: "100%", align: "center", 
            fontSize: 14, color: colors.textDim, charSpacing: 5, fontFace: fontMono 
        });
        pptxSlide.addText(slide.title, { 
            x: 0.5, y: 2.5, w: 9, align: "center", 
            fontSize: 44, color: colors.white, bold: true, fontFace: fontMain
        });
        // Decorative Line
        pptxSlide.addShape(pres.ShapeType.line, {
            x: 4.5, y: 4, w: 1, h: 0, line: { color: colors.textDim, width: 1 } 
        });
        pptxSlide.addText(slide.subtitle, { 
            x: 0.5, y: 4.5, w: 9, align: "center", 
            fontSize: 24, color: colors.accent, fontFace: fontMain 
        });
        if (slide.description) {
            pptxSlide.addText(slide.description, { 
                x: 2, y: 5.5, w: 6, align: "center", 
                fontSize: 16, color: colors.textDim, fontFace: fontMain 
            });
        }
      } 
      
      else if (slide.id === SlideType.TOC) {
        // Left Header
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 36, color: colors.white, bold: true, fontFace: fontMain });
        pptxSlide.addText(slide.subtitle, { x: 0.5, y: 1.1, fontSize: 12, color: colors.accent, fontFace: fontMono });
        
        // Grid Content
        slide.details?.forEach((item, idx) => {
             const col = idx % 2;
             const row = Math.floor(idx / 2);
             const xPos = col === 0 ? 0.8 : 5.5;
             const yPos = 2.0 + (row * 1.5);
             
             // Number
             pptxSlide.addText(item.label, { 
                 x: xPos, y: yPos, w: 1, fontSize: 32, color: "334155", fontFace: fontMono, bold: true 
             });
             // Separator Line
             pptxSlide.addShape(pres.ShapeType.line, {
                 x: xPos + 1.2, y: yPos + 0.3, w: 0.05, h: 0.4, line: { color: colors.accent, width: 2 }
             });
             // Text
             pptxSlide.addText(item.value as string, { 
                 x: xPos + 1.5, y: yPos + 0.1, w: 3.5, fontSize: 18, color: colors.textMain, fontFace: fontMain 
             });
        });
      }
      
      else if (slide.id === SlideType.CONCEPTS) {
        // Header
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 36, color: colors.white, bold: true, fontFace: fontMain });
        pptxSlide.addText(slide.subtitle, { x: 0.5, y: 1.1, fontSize: 12, color: colors.accent, fontFace: fontMono });

        // 3 Glass Panels
        const cards = [
            { t: "自然观", e: "View of Nature", d: "人们对自然界最根本的看法和观点。" },
            { t: "科学方法", e: "Methodology", d: "为了获得客观真理而采用的一整套规则与程序。" },
            { t: "科学认识", e: "Knowledge", d: "通过方法研究获得的客观事实、理论与定律。" }
        ];

        cards.forEach((card, i) => {
            const xPos = 0.5 + (i * 3.1);
            const yPos = 2.5;
            
            // Glass Panel Shape (Semi-transparent rect)
            pptxSlide.addShape(pres.ShapeType.roundRect, { 
                x: xPos, y: yPos, w: 2.8, h: 3.5, rectRadius: 0.2,
                fill: { color: colors.cardBg, transparency: 85 },
                line: { color: colors.white, width: 0.5, transparency: 90 }
            });

            // Content
            pptxSlide.addText(card.t, { x: xPos + 0.2, y: yPos + 0.4, w: 2.4, fontSize: 24, color: colors.white, bold: true, fontFace: fontMain });
            pptxSlide.addText(card.e, { x: xPos + 0.2, y: yPos + 0.9, w: 2.4, fontSize: 10, color: colors.textDim, fontFace: fontMono });
            pptxSlide.addText(card.d, { x: xPos + 0.2, y: yPos + 1.4, w: 2.4, fontSize: 16, color: colors.textMain, fontFace: fontMain });
        });
      }

      else if (slide.id === SlideType.SUMMARY) {
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 36, color: colors.white, bold: true, fontFace: fontMain });
        
        // 3 Step Process
        const steps = [
             { step: "01", t: "自然观", d: "Paradigm" },
             { step: "02", t: "方法论", d: "Method" },
             { step: "03", t: "科学认识", d: "Knowledge" }
        ];

        // Connection Line
        pptxSlide.addShape(pres.ShapeType.line, { x: 2, y: 3.5, w: 6, h: 0, line: { color: colors.border, width: 1, dashType: 'dash' } });

        steps.forEach((s, i) => {
            const xPos = 1.5 + (i * 2.8);
            // Circle Background
            pptxSlide.addShape(pres.ShapeType.ellipse, { 
                x: xPos + 0.5, y: 2.8, w: 1.4, h: 1.4, 
                fill: { color: colors.bg, transparency: 0 },
                line: { color: colors.accent, width: 1 } 
            });
            // Step Number
            pptxSlide.addText(s.step, { x: xPos + 0.5, y: 3, w: 1.4, align: "center", fontSize: 12, color: colors.accent, fontFace: fontMono });
            // Title
            pptxSlide.addText(s.t, { x: xPos, y: 4.3, w: 2.4, align: "center", fontSize: 24, color: colors.white, bold: true, fontFace: fontMain });
            pptxSlide.addText(s.d, { x: xPos, y: 4.8, w: 2.4, align: "center", fontSize: 12, color: colors.textDim, fontFace: fontMono });
        });

        // Quote Box
        pptxSlide.addShape(pres.ShapeType.roundRect, {
            x: 2, y: 5.8, w: 6, h: 1.2, rectRadius: 0.1,
            fill: { color: colors.cardBg, transparency: 80 },
            line: { color: colors.accent, width: 0, transparency: 100 } // Accent left border simulation
        });
        // Accent border on left
        pptxSlide.addShape(pres.ShapeType.rect, { x: 2, y: 5.8, w: 0.05, h: 1.2, fill: { color: colors.accent } });
        
        pptxSlide.addText("“新知识迫使我们抛弃旧的世界观，从而开启新的循环。”", { 
            x: 2.2, y: 6.0, w: 5.6, align: "center", fontSize: 18, color: colors.textMain, italic: true, fontFace: fontMain 
        });
      }
      
      else if (slide.id === SlideType.ENDING) {
        pptxSlide.addText(slide.title, { x: 0, y: 3, w: "100%", align: "center", fontSize: 40, color: colors.white, fontFace: fontMain });
        pptxSlide.addText(slide.subtitle, { x: 0, y: 4, w: "100%", align: "center", fontSize: 20, color: colors.accent, fontFace: fontMono });
      }

      else {
        // --- GENERIC CONTENT SLIDE (The bulk of the content) ---
        // Two column layout simulation
        
        // LEFT COLUMN (Header)
        pptxSlide.addText(slide.subtitle, { x: 0.5, y: 0.5, fontSize: 10, color: colors.textDim, fontFace: fontMono, line: { color: colors.border, width: 0.5 } });
        
        // Handle Multiline Title (split by colon usually in data)
        const titles = slide.title.split('：');
        if (titles.length > 1) {
            pptxSlide.addText(titles[0], { x: 0.5, y: 0.8, fontSize: 24, color: colors.textDim, fontFace: fontMain });
            pptxSlide.addText(titles[1], { x: 0.5, y: 1.3, fontSize: 36, color: colors.white, bold: true, fontFace: fontMain });
        } else {
             pptxSlide.addText(slide.title, { x: 0.5, y: 0.8, fontSize: 36, color: colors.white, bold: true, fontFace: fontMain });
        }

        if (slide.person) {
            pptxSlide.addShape(pres.ShapeType.line, { x: 0.5, y: 2.2, w: 0, h: 0.4, line: { color: colors.accent, width: 3 } });
            pptxSlide.addText(slide.person, { x: 0.6, y: 2.2, fontSize: 14, color: colors.accent, italic: true, fontFace: fontMain });
        }

        // RIGHT COLUMN (Details as Cards)
        // We start drawing cards from x = 4
        slide.details?.forEach((detail, i) => {
            let yPos = 0.5 + (i * 1.6); 
            // Compact logic if many items
            if (slide.details && slide.details.length > 3) {
                yPos = 0.5 + (i * 1.5);
            }

            // 1. Draw Glass Panel Background for each item
            pptxSlide.addShape(pres.ShapeType.roundRect, {
                x: 4.2, y: yPos, w: 5.5, h: 1.4, rectRadius: 0.1,
                fill: { color: colors.cardBg, transparency: 90 },
                line: { color: colors.border, width: 0.5 }
            });

            // 2. Draw Label (The Title of the card)
            // Accent Dot
            pptxSlide.addShape(pres.ShapeType.ellipse, { x: 4.4, y: yPos + 0.25, w: 0.1, h: 0.1, fill: { color: colors.accent } });
            // Label Text
            pptxSlide.addText(detail.label, { 
                x: 4.6, y: yPos + 0.15, w: 4.8, fontSize: 16, color: colors.white, bold: true, fontFace: fontMain 
            });

            // 3. Draw Value (The content)
            const textY = yPos + 0.5;
            if (Array.isArray(detail.value)) {
                // Bullet points handled manually for better control
                detail.value.forEach((val, idx) => {
                     pptxSlide.addText(`• ${val}`, { 
                         x: 4.6, y: textY + (idx * 0.25), w: 5, fontSize: 12, color: colors.textMain, fontFace: fontMain 
                     });
                });
            } else {
                pptxSlide.addText(detail.value, { 
                    x: 4.6, y: textY, w: 5, fontSize: 12, color: colors.textMain, fontFace: fontMain,
                    paraSpaceBefore: 5
                });
            }
        });
      }
    });

    pres.writeFile({ fileName: "Science_Evolution_Immersive.pptx" });
  };

  // --- RENDERERS ---

  const renderBackground = (id: SlideType) => {
    switch (id) {
      case SlideType.COVER: 
      case SlideType.TOC:
      case SlideType.CONCEPTS: 
      case SlideType.ENDING:
          return <NetworkBackground />;
      case SlideType.NEWTON: return <OrbitBackground />;
      case SlideType.EINSTEIN: return <WarpGridBackground />;
      case SlideType.QUANTUM: return <QuantumParticlesBackground />;
      case SlideType.ANDERSON: return <CrystalBackground />;
      case SlideType.SUMMARY: return <OrbitBackground />;
      default: return <NetworkBackground />;
    }
  };

  const renderCover = (data: SlideData) => (
    <div className="flex flex-col items-center text-center px-4 max-w-5xl">
      <h2 className="text-slate-dim/60 text-xs md:text-sm tracking-[0.3em] font-mono mb-8 uppercase animate-[fadeInUp_1s_ease-out_0.3s_forwards] opacity-0">
        SCIENTIFIC EVOLUTION
      </h2>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-thin tracking-tight text-slate-100 mb-6 leading-tight drop-shadow-2xl animate-[fadeInUp_1.2s_ease-out_0.5s_forwards] opacity-0">
        {data.title}
      </h1>
      <p className="text-cyan-300/80 text-lg md:text-2xl font-light tracking-wider mb-8 animate-[fadeInUp_1s_ease-out_0.7s_forwards] opacity-0">
        {data.subtitle}
      </p>
      <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-10 animate-[widthGrow_1s_ease-out_0.8s_forwards] opacity-0"></div>
      <p className="text-slate-dim text-lg md:text-2xl font-light max-w-3xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out_1s_forwards] opacity-0">
        {data.description}
      </p>
      <div className="mt-12 text-xl md:text-2xl font-mono text-slate-dim/60 animate-[fadeInUp_1s_ease-out_1.5s_forwards] opacity-0">
        {data.person}
      </div>
    </div>
  );

  const renderTOC = (data: SlideData) => (
    <div className="w-full max-w-6xl px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
        <p className="text-slate-dim font-mono text-sm tracking-widest uppercase">{data.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
        {data.details?.map((item, idx) => (
          <div key={idx} className="flex items-center group cursor-default" style={{ animation: `fadeInUp 0.8s ease-out ${0.2 + (idx * 0.1)}s forwards`, opacity: 0 }}>
            <div className="text-5xl font-thin text-slate-700 mr-6 font-mono group-hover:text-cyan-400 transition-colors duration-300">{item.label}</div>
            <div className="h-px bg-slate-800 flex-grow mr-4 group-hover:bg-cyan-900 transition-colors"></div>
            <div className="text-xl md:text-2xl text-slate-300 font-light group-hover:text-white transition-colors">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConcepts = (data: SlideData) => (
    <div className="w-full max-w-7xl px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-2 animate-fade-in-up">{data.title}</h1>
        <p className="text-slate-dim font-mono text-sm tracking-widest uppercase">{data.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { icon: Disc, title: "自然观", subtitle: "View of Nature", desc: "人们对自然界最根本的看法和观点，回答的是关于自然界“最本质”的问题。" },
          { icon: Share2, title: "科学认识方法", subtitle: "Methodology", desc: "为了获得客观真理而采用的一整套规则、程序、手段和技巧的总和（如：归纳、演绎、实验）。" },
          { icon: Layers, title: "科学认识", subtitle: "Scientific Knowledge", desc: "通过科学认识方法，对自然界进行研究获得的客观事实、理论、定律和模型。" }
        ].map((card, idx) => (
          <div key={idx} className="glass-panel p-10 rounded-xl border border-slate-light/5 hover:border-cyan-500/30 transition-all duration-500 group hover:-translate-y-2" style={{ animation: `fadeInUp 0.8s ease-out ${0.2 * idx}s forwards`, opacity: 0, transform: 'translateY(20px)' }}>
            <div className="mb-6 text-slate-light/80 group-hover:text-cyan-300 transition-colors">
              <card.icon size={40} strokeWidth={1} />
            </div>
            <h3 className="text-2xl text-slate-100 font-medium mb-1">{card.title}</h3>
            <div className="text-xs font-mono text-slate-dim/60 mb-6 uppercase tracking-wider">{card.subtitle}</div>
            <p className="text-slate-dim font-light leading-relaxed text-base md:text-lg text-justify">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentSlide = (data: SlideData) => (
    <div className="w-full max-w-[90rem] grid grid-cols-1 lg:grid-cols-12 gap-16 items-start content-center min-h-[60vh]">
      {/* Left Column: Header */}
      <div className="lg:col-span-4 text-left lg:sticky lg:top-32">
        <div className="inline-block px-3 py-1 border border-slate-light/20 rounded-full text-xs font-mono text-slate-dim mb-6 animate-[fadeInUp_0.8s_ease-out_0.1s_forwards] opacity-0">
          {data.subtitle}
        </div>
        <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-6 leading-tight animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
          {data.title.split('：').map((part, i) => (
              <span key={i} className={i===0 ? "block text-3xl opacity-70 mb-3" : "block"}>{part}</span>
          ))}
        </h1>
        {data.person && (
            <div className="text-xl text-cyan-200/80 font-light italic mb-8 animate-[fadeInUp_1s_ease-out_0.3s_forwards] opacity-0 border-l-4 border-cyan-500/30 pl-5">
            {data.person}
            </div>
        )}
        <div className="hidden lg:block w-16 h-1.5 bg-slate-800 rounded animate-[fadeInUp_1s_ease-out_0.4s_forwards] opacity-0"></div>
      </div>

      {/* Right Column: Details */}
      <div className="lg:col-span-8 grid grid-cols-1 gap-8">
        {data.details?.map((item, idx) => (
          <div 
            key={idx} 
            className="glass-panel p-8 rounded-xl border border-slate-light/5 hover:border-cyan-500/20 transition-colors"
            style={{ animation: `fadeInUp 0.8s ease-out ${0.4 + (idx * 0.1)}s forwards`, opacity: 0, transform: 'translateY(20px)' }}
          >
            <div className="flex items-center gap-4 mb-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]"></div>
                <div className="text-lg font-bold text-cyan-100 uppercase tracking-wider">{item.label}</div>
            </div>
            
            <div className="text-slate-300 font-light text-lg md:text-xl leading-loose pl-6 border-l border-slate-700/50 ml-[4px]">
              {Array.isArray(item.value) ? (
                <ul className="space-y-3 mt-2">
                  {item.value.map((val, vIdx) => (
                    <li key={vIdx} className="flex items-start gap-3">
                      <ArrowRight size={18} className="mt-1.5 text-slate-500 flex-shrink-0" />
                      <span>{val}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-300">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSummary = (data: SlideData) => (
    <div className="flex flex-col items-center w-full max-w-6xl px-4">
      <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-20 animate-fade-in-up">{data.title}</h1>
      
      <div className="relative w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent -z-10"></div>
        {[
          { step: "01", title: "自然观", desc: "决定了方法", sub: "Paradigm", icon: Microscope },
          { step: "02", title: "方法论", desc: "产出了知识", sub: "Method", icon: BrainCircuit },
          { step: "03", title: "科学认识", desc: "重塑了自然观", sub: "Knowledge", icon: Layers }
        ].map((item, i) => (
           <div key={i} className="relative flex flex-col items-center bg-navy-900/60 backdrop-blur-md border border-slate-700/50 p-10 rounded-2xl hover:bg-navy-800/60 transition-all duration-500 group"
                style={{ animation: `fadeInUp 0.8s ease-out ${0.3 + (i * 0.2)}s forwards`, opacity: 0 }}>
              <div className="absolute -top-6 bg-navy-950 border border-slate-700 text-cyan-400 font-mono text-sm px-4 py-1.5 rounded-full shadow-lg shadow-cyan-900/20 group-hover:bg-cyan-900/20 group-hover:text-cyan-300 transition-colors">
                {item.step}
              </div>
              <div className="mb-6 text-slate-400 mt-2 group-hover:text-cyan-400 transition-colors">
                  <item.icon size={36} strokeWidth={1} />
              </div>
              <h3 className="text-2xl text-slate-100 mb-2 font-medium">{item.title}</h3>
              <div className="text-xs text-cyan-400/60 font-mono uppercase mb-6 tracking-widest">{item.sub}</div>
              <p className="text-center text-slate-400 text-lg font-light">{item.desc}</p>
           </div>
        ))}
      </div>

      <div className="mt-20 glass-panel px-12 py-10 rounded-xl max-w-4xl text-center animate-[fadeInUp_1s_ease-out_1.5s_forwards] opacity-0 border-t-4 border-t-cyan-500/30">
         <p className="text-slate-200 text-2xl italic font-light leading-relaxed">
           “新知识迫使我们抛弃旧的世界观，从而开启新的循环。”
         </p>
      </div>
    </div>
  );

  const renderEnding = (data: SlideData) => (
    <div className="text-center px-4">
       <div className="mb-10 animate-spin-slow opacity-20">
         <Circle size={140} strokeWidth={0.5} className="text-white" />
       </div>
       <h1 className="text-6xl md:text-8xl font-thin text-white tracking-tighter mb-8 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
         {data.title}
       </h1>
       <div className="text-2xl font-mono text-cyan-400 tracking-widest uppercase animate-[fadeInUp_1s_ease-out_0.5s_forwards] opacity-0">
         {data.subtitle}
       </div>
    </div>
  );

  const currentData = slides[currentSlide];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-navy-900 text-slate-light selection:bg-cyan-900/30 font-sans">
      
      {/* Background Layer */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
           <div 
             key={index}
             className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out transform
               ${index === currentSlide 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-110 z-0'
               }`}
           >
             {/* Only render active background to save resources if needed, but here we render all for smooth transition. 
                 Optimized: Check if slide.id matches currentSlide.id to avoid re-rendering same background component type?
                 Actually, reusing the component instance is better. 
                 For simplicity in this effect stack, we render based on index but we could optimize.
             */}
              {index === currentSlide || Math.abs(index - currentSlide) <= 1 ? renderBackground(slide.id) : null}
           </div>
        ))}
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#020c1b_100%)] opacity-60"></div>

      {/* Content Layer */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 md:px-24 overflow-y-auto md:overflow-hidden no-scrollbar">
        <div key={currentSlide} className="w-full flex justify-center py-10 md:py-0">
           {currentData.id === SlideType.COVER && renderCover(currentData)}
           {currentData.id === SlideType.TOC && renderTOC(currentData)}
           {currentData.id === SlideType.CONCEPTS && renderConcepts(currentData)}
           {(currentData.id === SlideType.NEWTON || 
             currentData.id === SlideType.EINSTEIN || 
             currentData.id === SlideType.QUANTUM || 
             currentData.id === SlideType.ANDERSON) && renderContentSlide(currentData)}
           {currentData.id === SlideType.SUMMARY && renderSummary(currentData)}
           {currentData.id === SlideType.ENDING && renderEnding(currentData)}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-6 left-0 right-0 z-50 px-6 md:px-12 flex justify-between items-end pointer-events-none">
        
        <div className="hidden md:flex items-center space-x-6 text-slate-dim text-[10px] font-mono tracking-widest uppercase opacity-60 pointer-events-auto">
          <span>{currentSlide + 1} <span className="mx-2">/</span> {slides.length}</span>
          <div className="w-64 h-[2px] bg-slate-800 relative overflow-hidden rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-cyan-400/50 transition-all duration-500 ease-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
          <span>{currentData.id}</span>
        </div>

        <div className="md:hidden text-[10px] font-mono text-slate-dim opacity-50 pointer-events-auto bg-navy-900/80 px-3 py-1 rounded-full backdrop-blur">
          {currentSlide + 1} / {slides.length}
        </div>

        <div className="flex items-center space-x-2 glass-panel rounded-full p-1.5 backdrop-blur-md bg-navy-900/40 border-slate-700/50 pointer-events-auto shadow-lg shadow-black/20">
           <button 
             onClick={handlePrev} 
             disabled={currentSlide === 0}
             className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 text-slate-light"
           >
             <ChevronLeft size={20} strokeWidth={1} />
           </button>
           <button 
             onClick={handleNext} 
             disabled={currentSlide === slides.length - 1}
             className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 text-slate-light"
           >
             <ChevronRight size={20} strokeWidth={1} />
           </button>
        </div>
        
        <div className="flex items-center space-x-2 pointer-events-auto">
            <button 
                onClick={generatePPTX}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-dim hover:text-slate-light opacity-60 hover:opacity-100"
                title="导出 PPT"
            >
                <Download size={16} strokeWidth={1.5} />
            </button>
            <button onClick={toggleFullscreen} className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-dim hover:text-slate-light opacity-60 hover:opacity-100 hidden md:block">
            {isFullscreen ? <Minimize2 size={16} strokeWidth={1.5} /> : <Maximize2 size={16} strokeWidth={1.5} />}
            </button>
        </div>
      </div>

      <style>{`
        @keyframes widthGrow { from { width: 0; opacity: 0; } to { width: 6rem; opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SlideDeck;
