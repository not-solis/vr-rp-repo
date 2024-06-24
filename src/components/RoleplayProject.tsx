import './RoleplayProject.css';

export enum RoleplayStatus {
  Active,
  Inactive,
  Upcoming,
  Hiatus
}

export enum RoleplayEntryProcess {
  Open,
  Vouch,
  Vetting,
  InviteOnly,
  Application
}

export enum RoleplayApplicationProcess {
  NoApplication,
  PlayerApplication,
  CharacterSheet,
  EventSignup
}

interface ProjectProps {
  name: string
  imageUrl?: string
  description?: string
  setting?: string
  tags: string[]
  runtime: Date[]
  status: RoleplayStatus,
  entryProcess: RoleplayEntryProcess,
  applicationProcess: RoleplayApplicationProcess,
  hasSupportingCast: boolean,
  isMetaverse: boolean,
  isQuestCompatible: boolean,
  discordUrl?: string,
  otherLinks: string[]
}

export const RoleplayProject = (props: ProjectProps) => {
  return (
    <div className='project-card'>
      <div className='project-image'>
        <img src={props.imageUrl} />
      </div>
      <div className='project-details'>
        <h3>{props.name}</h3>
        <div className='tag'>{RoleplayStatus[props.status]}</div>
        <p>{props.description}</p>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {props.tags.map(t => <div className='tag'>{t}</div>)}
        </div>
        <div>
          {props.runtime.map(d => <p>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]}s at {d.toLocaleTimeString()}</p>)}
        </div>
        <a href={props.discordUrl} >Discord</a>
      </div>
    </div>
  )
}