import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, Users, Trophy, Star, Zap } from "lucide-react"

const achievements = [
  {
    category: "Certifications",
    icon: <Award className="w-6 h-6" />,
    items: [
      {
        title: "Generative AI",
        issuer: "GOOGLE Cloud",
        year: "2025",
        level: "Professional"
      },
      {
        title: "Google Cloud Professional Developer",
        issuer: "Google Cloud",
        year: "2023",
        level: "Professional"
      },
      {
        title: "Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation",
        year: "2022",
        level: "Professional"
      }
    ]
  },
  {
    category: "Awards & Recognition",
    icon: <Trophy className="w-6 h-6" />,
    items: [
      {
        title: "Best Innovation Award",
        issuer: "TechCorp Annual Awards",
        year: "2023",
        level: "Company"
      },
      {
        title: "Hackathon Winner - FinTech Challenge",
        issuer: "National Banking Innovation Hub",
        year: "2022",
        level: "National"
      },
      {
        title: "Outstanding Academic Performance",
        issuer: "University Merit List",
        year: "2020",
        level: "Academic"
      }
    ]
  },
  {
    category: "Speaking & Leadership",
    icon: <Users className="w-6 h-6" />,
    items: [
      {
        title: "Tech Talk: Microservices at Scale",
        issuer: "DevConf 2023",
        year: "2023",
        level: "Conference"
      },
      {
        title: "Workshop: Modern React Patterns",
        issuer: "Local Developer Meetup",
        year: "2023",
        level: "Community"
      },
      {
        title: "Mentorship Program Lead",
        issuer: "TechCorp Mentorship Initiative",
        year: "2022-Present",
        level: "Corporate"
      }
    ]
  },
  {
    category: "Open Source & Publications",
    icon: <BookOpen className="w-6 h-6" />,
    items: [
      {
        title: "React Performance Optimization Library",
        issuer: "GitHub - 2.5K Stars",
        year: "2023",
        level: "Open Source"
      },
      {
        title: "IoT Security Best Practices",
        issuer: "Tech Journal Publication",
        year: "2022",
        level: "Publication"
      },
      {
        title: "Contributor to Node.js Ecosystem",
        issuer: "Multiple NPM Packages",
        year: "2021-Present",
        level: "Open Source"
      }
    ]
  }
]

const levelColors = {
  "Professional": "bg-tech-blue text-white",
  "Company": "bg-green-500 text-white",
  "National": "bg-purple-500 text-white",
  "Academic": "bg-orange-500 text-white",
  "Conference": "bg-blue-500 text-white",
  "Community": "bg-pink-500 text-white",
  "Corporate": "bg-indigo-500 text-white",
  "Open Source": "bg-green-600 text-white",
  "Publication": "bg-red-500 text-white"
}

const AchievementsSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-section">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-tech-dark mb-6">
            Achievements & Recognition
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Recognized for technical excellence, innovation, and contributions to the developer community 
            through certifications, awards, and thought leadership.
          </p>
          <div className="w-24 h-1 bg-gradient-hero mx-auto mt-6"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((category, index) => (
            <Card key={index} variant="tech" className="h-full group hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-tech-blue/10 rounded-lg text-tech-blue group-hover:bg-tech-blue group-hover:text-white transition-all duration-300">
                    {category.icon}
                  </div>
                  <span className="group-hover:text-tech-blue transition-colors">
                    {category.category}
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {category.items.map((item, i) => (
                  <div key={i} className="p-4 bg-white/50 rounded-lg space-y-2 hover:bg-white/80 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-tech-dark leading-tight">
                        {item.title}
                      </h4>
                      <Badge 
                        className={`text-xs ${levelColors[item.level as keyof typeof levelColors] || 'bg-gray-500 text-white'} shrink-0`}
                      >
                        {item.year}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.issuer}
                    </p>
                    <Badge variant="outline" className="text-xs bg-tech-gray border-none">
                      {item.level}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-tech-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-tech-blue" />
            </div>
            <div className="text-3xl font-bold text-tech-dark">15+</div>
            <div className="text-sm text-muted-foreground">Certifications</div>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-tech-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-tech-blue" />
            </div>
            <div className="text-3xl font-bold text-tech-dark">8</div>
            <div className="text-sm text-muted-foreground">Awards Won</div>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-tech-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-tech-blue" />
            </div>
            <div className="text-3xl font-bold text-tech-dark">25+</div>
            <div className="text-sm text-muted-foreground">Talks Given</div>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-tech-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-tech-blue" />
            </div>
            <div className="text-3xl font-bold text-tech-dark">5K+</div>
            <div className="text-sm text-muted-foreground">GitHub Stars</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AchievementsSection