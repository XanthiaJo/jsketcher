import React, {useState} from 'react';
import connect from 'ui/connect';
import Toolbar from 'ui/components/Toolbar';
import {ConnectedActionButton, ToolbarActionButtons} from './PlugableToolbar';
import ls from './HeadsUpToolbar.less';
import {combine} from 'lstream';

const SECTION_LABELS = [
  'Views',
  'Display',
  'Inspect',
  'Setup',
  'Create',
  'Boolean',
  'Modify',
  'Pattern',
  'Primitives',
  'Hole',
  'Project',
  'Wire',
];

function splitIntoSections(actions) {
  const sections = [];
  let current = [];

  actions.forEach(actionRef => {
    if (actionRef === '-') {
      if (current.length) {
        sections.push(current);
        current = [];
      }
      return;
    }
    current.push(actionRef);
  });

  if (current.length) {
    sections.push(current);
  }

  return sections;
}

export const HeadsUpToolbar = connect(streams => combine(
    streams.ui.toolbars.headsUp,
    streams.ui.toolbars.headsUpShowTitles,
    streams.ui.toolbars.headsUpQuickActions).map(([actions, showTitles, quickActions]) => ({actions, showTitles, quickActions})))(
  function HeadsUpToolbar({actions, showTitles, quickActions}) {
    const sections = splitIntoSections(actions);
    const [openSection, setOpenSection] = useState(null);

    return <Toolbar flat className={ls.ribbon}>
      <div className={ls.quickButtons}>
        {quickActions.map(actionRef => {
          const [actionId, overrides] = Array.isArray(actionRef) ? actionRef : [actionRef, {}];
          return <ConnectedActionButton key={actionId} actionId={actionId} size='small' noLabel={true} {...overrides} />;
        })}
      </div>
      <div className={ls.mainActions}>
        {sections.map((sectionActions, index) => (
          <div className={`${ls.section} ${openSection === index ? ls.sectionOpen : ''}`} key={'HeadsUpSection' + index}>
            <button
              className={ls.sectionToggle}
              type='button'
              onClick={() => setOpenSection(openSection === index ? null : index)}>
              {SECTION_LABELS[index] || 'Tools'}
            </button>
            <div className={ls.sectionActions}>
              <ToolbarActionButtons actions={sectionActions} showTitles={showTitles}/>
            </div>
          </div>
        ))}
      </div>
    </Toolbar>
  }
);
