import { useAuth } from '../context/AuthProvider';
import './RoleplayProject.css';

export enum RoleplayStatus {
  Active,
  Inactive,
  Upcoming,
  Hiatus,
}

export enum RoleplayEntryProcess {
  Open,
  Vouch,
  Vetting,
  InviteOnly,
  Application,
}

export enum RoleplayApplicationProcess {
  NoApplication,
  PlayerApplication,
  CharacterSheet,
  EventSignup,
}

interface ProjectProps {
  name: string;
  owners: string[];
  lastUpdated: Date;
  imageUrl?: string;
  description?: string;
  setting?: string;
  tags: string[];
  runtime: Date[];
  status: RoleplayStatus;
  entryProcess: RoleplayEntryProcess;
  applicationProcess: RoleplayApplicationProcess;
  hasSupportingCast: boolean;
  isMetaverse: boolean;
  isQuestCompatible: boolean;
  discordUrl?: string;
  otherLinks: string[];
}

export const RoleplayProject = (props: ProjectProps) => {
  const { userData } = useAuth();
  const isOwner = props.owners.includes(userData?.username || '');

  return (
    <div className='project-card'>
      <div className='project-header'>
        <div className='project-image'>
          <img src={props.imageUrl} />
        </div>
        <div className='project-overview'>
          <div style={{ whiteSpace: 'nowrap' }}>
            <h3>
              {props.name}
              {isOwner ? ' (OWNED)' : null}
            </h3>
            <div className='tag'>{RoleplayStatus[props.status]}</div>
          </div>
          <div>
            {props.tags.map((t) => (
              <div className='tag'>{t}</div>
            ))}
          </div>
          <p>{props.description}</p>
          <div>
            {props.runtime.map((d) => (
              <p>
                {
                  [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ][d.getDay()]
                }
                s at {d.toLocaleTimeString()}
              </p>
            ))}
          </div>
          <a href={props.discordUrl}>Discord</a>
          <p>LAST UPDATED: {props.lastUpdated.toISOString()}</p>
        </div>
      </div>
    </div>
  );
};
