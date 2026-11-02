import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, ExternalLink, Zap, Database, Brain, Shield, Globe, Smartphone } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "E-Commerce Analytics Platform",
    description: "Real-time analytics dashboard for e-commerce businesses with ML-powered insights and automated reporting.",
    tech: ["React", "Node.js", "PostgreSQL", "TensorFlow", "AWS"],
    icon: <Database className="w-8 h-8 text-tech-blue" />,
    features: ["Real-time dashboards", "Machine learning insights", "Automated reporting"],
    github: "#",
    demo: "#"
  },
  {
    id: 2,
    title: "IoT Smart Home System",
    description: "Comprehensive smart home solution with embedded device integration and mobile app control.",
    tech: ["C++", "Python", "React Native", "MongoDB", "MQTT"],
    icon: <Smartphone className="w-8 h-8 text-tech-blue" />,
    features: ["Device automation", "Mobile control", "Energy monitoring"],
    github: "#",
    demo: "#"
  },
  {
    id: 3,
    title: "Railway Reservation System",
    description: "A Java Swing desktop application that streamlines train-ticket booking with seat availability, fare calculation, and printable tickets.",
    tech: ["Seat availability check",
      "Fare calculation",
      "Booking & cancellation",
      "Printable ticket & e-ticket"],
    icon: <Brain className="w-8 h-8 text-tech-blue" />,
    features: ["Bug detection", "Security analysis", "Code suggestions"],
    github: "https://github.com/anujgupta1300/Railway-Reservation-System-JAVA-GUI-",
    demo: "#"
  },
  {
    id: 4,
    title: "Js Weather",
    description: "A simple and responsive Weather Website built with HTML, CSS, and JavaScript. It provides real-time weather data such as temperature, humidity, wind speed, and conditions using an external weather API.",
    tech: ["Html", "Css", "JavaScript"],
    icon: <Shield className="w-8 h-8 text-tech-blue" />,
    features: ["temperature", "humidity", "wind speed", "weather conditions"],
    github: "https://github.com/anujgupta1300/Js-Weather",
    demo: "https://jirasweb.netlify.app/"
  },
  {
    id: 5,
    title: "Portfolio Website",
    description: "This very portfolio! A responsive Next.js + Tailwind CSS site to showcase my skills, projects, and achievements in a single scroll.",
    tech: ["Go", "Docker", "Redis", "Prometheus", "Grafana"],
    icon: <Zap className="w-8 h-8 text-tech-blue" />,
    features: ["Responsive design",
      "Dark & light mode ready",
      "Smooth scroll navigation",
      "Reusable component library"],
    github: "#",
    demo: "#"
  },
  {
    id: 6,
    title: "50 Projects",
    description: "50 usefull projects by using Html, Css and JavaScript.",
    tech: ["Html", "Css", "JavaScript"],
    icon: <Globe className="w-8 h-8 text-tech-blue" />,
    features: ["...", "...", "...", "..."],
    github: "https://github.com/anujgupta1300/50-projects",
    demo: "#"
  }
]

const ProjectsSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-section">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-tech-dark mb-6">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A showcase of my technical expertise across various domains, from web applications 
            to embedded systems and AI-powered solutions.
          </p>
          <div className="w-24 h-1 bg-gradient-hero mx-auto mt-6"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} variant="project" className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  {project.icon}
                  <CardTitle className="text-xl group-hover:text-tech-blue transition-colors">
                    {project.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs bg-tech-gray border-none">
                      {tech}
                    </Badge>
                  ))}
                </div>
                
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-tech-dark">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-tech-blue rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="tech" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(project.github, '_blank')}
                    disabled={project.github === '#'}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Code
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(project.demo, '_blank')}
                    disabled={project.demo === '#'}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => window.open('https://github.com/anujgupta1300', '_blank')}
          >
            <Github className="mr-2" />
            View All Projects on GitHub
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ProjectsSection