import ProjectCard from "../cards/ProjectCard";

const ProjectGridView = ({ projects, onClick }) => {
    
  return (
    <div className="grid grid-cols-1 gap-4 ">
      {projects.map((project) => (
        <ProjectCard onClick={onClick} project={project} key={project.id} />
      ))}
    </div>
  );
};

export default ProjectGridView;
