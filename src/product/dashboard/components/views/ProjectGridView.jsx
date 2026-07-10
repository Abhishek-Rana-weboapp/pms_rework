import ProjectCard from "../cards/ProjectCard";

const ProjectGridView = ({ projects, onClick }) => {
    
  return (
    <div className="grid  xl:grid-cols-3 md:grid-cols-2 gap-4 ">
      {projects.map((project) => (
        <ProjectCard onClick={onClick} project={project} key={project.id} />
      ))}
    </div>
  );
};

export default ProjectGridView;
