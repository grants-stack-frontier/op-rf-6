import React from 'react';

import { useBallotContext } from '@/contexts/BallotContext';

import { SearchInput } from '../common/search-input';
import { MetricsEditor } from '../metrics-editor';

import { ProjectItem } from './project-item';

export function BallotProjects() {
  const { displayProjects, budget, searchTerm, handleSearch } =
    useBallotContext();

  return (
    <>
      <MetricsEditor budget={budget} />
      <SearchInput
        className="my-2"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <div>
        {displayProjects.map((proj, i) => (
          <ProjectItem key={proj.project_id} project={proj} index={i} />
        ))}
      </div>
    </>
  );
}
