import { DarkModeToggle } from '../components/DarkModeToggle';
import { RoleplayApplicationProcess, RoleplayEntryProcess, RoleplayProject, RoleplayStatus } from '../components/RoleplayProject';
import './Repo.css';

export const App = () => {
  return (
    <div style={{ height: '100vh' }}>
      <div className='nav'>
        <header>VR Roleplay Repo </header>
        {/* <DarkModeToggle /> */}
      </div>
      <div className='project-container'>
        {[
          {
            name: 'The Best Roleplay',
            imageUrl: 'https://cdn.discordapp.com/attachments/1092610233509105665/1253827287363747931/image.png?ex=6679e828&is=667896a8&hm=30460601e4925ad3236b8c16249a59ee66ef151bc8bd0c12563f22d29459a247&',
            description: 'This roleplay is incredible. It takes place in the most fantasy place with the most weapony weapons and more dice than you can humanly accept in a given setting.',
            tags: ['cool', 'nice'],
            runtime: [
              new Date()
            ],
            status: RoleplayStatus.Active,
            entryProcess: RoleplayEntryProcess.Open,
            applicationProcess: RoleplayApplicationProcess.NoApplication,
            hasSupportingCast: true,
            isMetaverse: false,
            isQuestCompatible: true,
            discordUrl: 'http://www.google.com',
            otherLinks: []
          }
        ].map(p => <RoleplayProject {...p} />)}
      </div>
    </div>

  );
}

export default App;
