import {
  CardMedia,
  Drawer,
  Link,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  remapRoleplayProject,
  RoleplayProjectProps,
} from '../model/RoleplayProject';
import './RoleplayProjectPage.css';
import { useEffect, useRef, useState } from 'react';
import { TextTag } from '../components/TextTag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import Markdown from 'react-markdown';
import { ThemedMarkdown } from '../components/ThemedMarkdown';

export const RoleplayProjectPage = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const theme = useTheme();
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
          return remapRoleplayProject(project) as RoleplayProjectProps;
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
    return null;
  }

  project.imageUrl = 'https://media1.tenor.com/m/QQiopAKBLyUAAAAd/miber.gif'; // TODO: DELETE
  project.description = `
  # Vertit auras ille

## Vana nitidissima fugit portat

Lorem markdownum mihi. Post nunc pater, puerum Cnosia iamque, dei suus ritu,
mixtaeque aries. *Elin est*, et abesse e auctor sanguine fossas. Una virtus
vires; cum discedit defectos, [tueri](http://www.quasfuerat.net/ferrum.php) dum!
Infitianda honoratos longe: **iura**: posse fuit ab siquid est, lateri sequitur
et nisi.

Inbutum faciente, Clytii tu infelix ordine et positus fertur conpositas dedit
palmas numina! Dicta verba, pecudesque *nunc*: poenam patriaque notam, frater
gaudet, ira cum redeamus? Si dicta materiam iungit; nondum non ne domosque
fessos cum rudente poteram, morte. Sua matrem recusat numina precari
[ululatibus](http://dabaturmoly.com/pertimui.aspx) recumbis.

## Gloria subit neque

Catenis meritis aliisque natantia dubitet certamine terribili in muros sine.
Fugit finierat mea cetera reddit crescere **Pario** sub velant quorum, illo.

> Nunc tellus, sub nostros inplicuit cineres Talia contenta et altis: et. Dantur
dabat gradu sibi promptu Nise, nec, *a supplex sine*, satis facti.

- Abdita nec nec conpescuit lintea utque
- Adoratis ornabant simul
- In primi fastigia nitidum currum iusto capiunt
- Vestes quidve

## Moveant inpatiens natus

Dabat Oechalia congerie volucres dant caede repellite et certe, proles neque
Bacchus coniunx citus num lecto illo mille. Torvis umeros. Mora alvum erat piae
petit: urbem, opus ille oblivia corpora *Propoetides* aura edidicisse iam nec;
**ubi**.

- Quibus Pyramus fatigat vultu silentia Caenis incinxit
- Macareus ubi eventu stimulis inpune auxiliaris cetera
- Partim volucres
- Saturnia turba
- Flammaeque satis
- Non at victima visa mille nostri coepit

## Redditur vincendo

Vestis qua videant parva si tale ut Asopidos numina: dixit deos impetus in quae.
Prosunt pependit an vulnera nervis.

Tendunt suos parari poscor hominis meorum traherent erat des multiplicique
petebar teneros. Genus profana spolieris, ille coepit solverat et duxit stupuit!
Sortem distinctas *sic* mox molles luridus scitis *aras Iuppiter* manum nunc
cadit cervus vulnera adhuc virentem est dixit iaculo.
  `;

  const {
    name,
    owners,
    tags,
    description,
    shortDescription,
    imageUrl,
    setting,
    entryProcess,
    applicationProcess,
    isMetaverse,
    hasSupportingCast,
    isQuestCompatible,
    discordUrl,
  } = project;

  let descriptionElement;
  if (description) {
    descriptionElement = (
      <Typography variant='h5'>
        <ThemedMarkdown>{description}</ThemedMarkdown>
      </Typography>
    );
  } else if (shortDescription) {
    descriptionElement = (
      <>
        <Typography variant='subtitle1'>
          (no description provided, using short description)
        </Typography>
        <Typography variant='body1'>{shortDescription}</Typography>
      </>
    );
  } else {
    descriptionElement = (
      <Typography variant='subtitle1'>(no description provided)</Typography>
    );
  }

  const toggleSidebar = () => setSidebarExpanded(!isSidebarExpanded);
  const sidebarInfoElement = (
    label: string,
    value: string | undefined,
    icon: IconName,
    iconPrefix: IconPrefix = 'fas'
  ) => (
    <Tooltip
      title={label}
      placement='left'
      enterDelay={50}
      leaveDelay={100}
      slotProps={{
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -6] } }],
        },
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <FontAwesomeIcon
          width={20}
          icon={[iconPrefix, icon]}
          style={{ paddingTop: 4 }}
        />
        <Typography variant='body1' style={{ paddingTop: 0, paddingLeft: 12 }}>
          {value}
        </Typography>
      </div>
    </Tooltip>
  );

  return (
    <div className='project-page'>
      <div className={`project-info${isSidebarExpanded ? '' : ' closed'}`}>
        <Typography variant='title'>{project.name}</Typography>
        {descriptionElement}
      </div>
      <div className={`project-sidebar${isSidebarExpanded ? '' : ' closed'}`}>
        <div id='project-sidebar-content'>
          {imageUrl && (
            <CardMedia component='img' image={imageUrl} alt={`${name} icon`} />
          )}

          {tags && tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {tags.map((t) => (
                <TextTag tag={t} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {owners &&
              owners.length > 0 &&
              sidebarInfoElement('Owners', owners.join(', '), 'user')}
            {sidebarInfoElement('Setting', setting, 'earth-americas')}
            {sidebarInfoElement(
              'Metaverse',
              `${isMetaverse ? 'In' : 'Not in'} the Metaverse`,
              'globe'
            )}
            {sidebarInfoElement('Entry Process', entryProcess, 'door-open')}
            {sidebarInfoElement(
              'Application Process',
              applicationProcess,
              'clipboard',
              'far'
            )}
            {sidebarInfoElement(
              'Supporting Cast',
              `Support cast positions ${
                hasSupportingCast ? '' : 'un'
              }available`,
              'handshake'
            )}
            {sidebarInfoElement(
              'Quest Compatibility',
              `${isQuestCompatible ? '' : 'Not '}Quest compatible`,
              'meta',
              'fab'
            )}
          </div>

          {discordUrl && (
            <Link
              href={discordUrl}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <FontAwesomeIcon width={20} icon={['fab', 'discord']} />
              <Typography variant='body2' style={{ paddingLeft: 6 }}>
                Discord
              </Typography>
            </Link>
          )}

          <div
            id='sidebar-toggle'
            className='disabled-text-interaction'
            onClick={toggleSidebar}
          >
            <Typography
              variant='h5'
              style={{ marginLeft: '4px', marginBottom: '4px' }}
            >
              {isSidebarExpanded ? '>>>' : '<<<'}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
