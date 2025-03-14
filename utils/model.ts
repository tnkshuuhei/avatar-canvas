type Model = {
  id: string;
  model: string;
  image: string;
  title: string;
  desctiption: string;
  tags: string[];
  voice: string;
};
export const models: Model[] = [
  {
    id: "sustainability",
    model: "/models/panda.vrm",
    image: "/thumbnail/panda.png",
    title: "Sustain Focus",
    desctiption:
      "SustainFocus employs a sophisticated balanced framework that considers multiple stakeholder perspectives. The model evaluates funding decisions based on sustainability, long-term viability and community governance.",
    tags: [
      "Sustainability Metrics",
      "Long-term Impact Projection",
      "Governance Structure Analysis",
      "Community Participation Scorer",
    ],
    voice: "EXAVITQu4vr4xnSDxMaL", // Sarah
  },
  {
    id: "equity",
    model: "/models/avatar-1.vrm",
    image: "/thumbnail/avatar-1.png",
    title: "Equity Max",
    desctiption:
      "EquityMax employs a sophisticated equity-focused methodology that prioritizes fair distribution of resources. The model evaluates funding decisions based on impact on underserved communities and equitable access.",
    tags: [
      "Population Impact Analysis",
      "Geographic Equity Weighting",
      "Underserved Population Targeting",
      "Community Input Interpreter",
    ],
    voice: "bIHbv24MWmeRgasZH58o", // Will
  },
  {
    id: "community",
    model: "/models/avatar-2.vrm",
    image: "/thumbnail/avatar-2.png",
    title: "Community Centric",
    desctiption:
      "CommunityCentric employs a sophisticated balanced framework that considers multiple stakeholder perspectives. The model evaluates funding decisions based on sustainability, long-term viability and community governance.",
    tags: [
      "Sustainability Metrics",
      "Long-term Impact Projection",
      "Governance Structure Analysis",
      "Community Participation Scorer",
    ],
    voice: "FGY2WhTYpPnrIDTdsKH5", // Laura
  },
  {
    id: "inovation",
    model: "/models/avatar-3.vrm",
    image: "/thumbnail/avatar-3.png",
    title: "Innovation Engine",
    desctiption:
      "InnovationEngine employs a sophisticated balanced framework that considers multiple stakeholder perspectives. The model evaluates funding decisions based on sustainability, long-term viability and community governance.",
    tags: [
      "Sustainability Metrics",
      "Long-term Impact Projection",
      "Governance Structure Analysis",
      "Community Participation Scorer",
    ],
    voice: "9BWtsMINqrJLrRacOk9x", // Aria
  },
  {
    id: "efficiency",
    model: "/models/avatar-4.vrm",
    image: "/thumbnail/avatar-4.png",
    title: "Efficient Alloc",
    desctiption:
      "EfficientAlloc employs a sophisticated efficiency-driven approach that maximizes return on investment. The model evaluates funding decisions based on cost-effectiveness, scalability and measurable outcomes.",
    tags: [
      "ROI Calculator",
      "Resource Optimization",
      "Scalability Predictor",
      "Cost-Benefit Analyzer",
    ],
    voice: "cgSgspJ2msm6clMCkdW9", // Jessica
  },
];
