import React from 'react';

import { useBallotRound5Context } from '@/contexts/BallotRound5Context';

import { SearchInput } from '../common/search-input';
import { MetricsEditor } from '../metrics-editor';
import { Card } from '../ui/card';

import { ProjectItem } from './project-item';

export function BallotProjects() {
  const { displayProjects, budget, searchTerm, handleSearch } =
    useBallotRound5Context();

  return (
    <Card className="p-6 space-y-8">
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
    </Card>
  );
}
