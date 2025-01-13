import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export const RoleplayProjectPage = () => {
  const { id } = useParams();
  const {
    data: project,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () =>
      fetch(`http://localhost:3001/projects/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((json) => {
          const project = json.data;
          return {
            id: project.id,
            name: project.name,
            owners: project.owners,
            lastUpdated: new Date(project.last_updated),
            imageUrl: project.image_url,
            description: project.description,
            setting: project.setting,
            tags: project.tags,
            runtime: [],
            status: project.status,
            entryProcess: project.entry_process,
            applicationProcess: project.application_process,
            hasSupportingCast: project.has_support_cast,
            isMetaverse: project.is_metaverse,
            isQuestCompatible: project.is_quest_compatible,
            discordUrl: project.discord_link,
            otherLinks: project.other_links,
          };
        }),
  });

  if (error) {
    return <div>Error loading page.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    // ID is invalid
    window.location.href = '/';
  }

  return <div>{project?.name}</div>;
};
