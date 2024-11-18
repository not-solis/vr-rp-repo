import { useAuth } from '../context/AuthProvider';
import { RoleplayProjectProps, RoleplayStatus } from '../model/RoleplayProject';
import './RoleplayProject.css';

export const RoleplayProject = (props: RoleplayProjectProps) => {
  const { userData } = useAuth();
  const isOwner = props.owners.includes(userData?.username || '');
  console.log(process.env.NODE_ENV);

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
          {process.env.NODE_ENV === 'development' && (
            <p>LAST UPDATED: {props.lastUpdated.toISOString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};
