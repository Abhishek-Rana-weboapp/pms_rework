import React from 'react'
import { useParams } from 'react-router-dom'
import { useArtifacts } from '../api/project/projectQueries';

const ArtifactList = () => {
    const {artifactType} = useParams();
    const {data:artifactData} = useArtifacts({type:artifactType.toUpperCase()})

    console.log(artifactData);
    
  return (
    <div>
       {artifactType}
    </div>
  )
}

export default ArtifactList
