import React from 'react';
import mapContext from 'ui/mapContext';
import {Section} from 'ui/components/Section';
import Fa from 'ui/components/Fa';
import ls from './ProjectManager.less';
import {ContextMenu, ContextMenuItem} from 'ui/components/Menu';
import cmn from 'ui/styles/common.less';
import Folder from 'ui/components/Folder';
import connect from 'ui/connect';
import exportTextData from 'gems/exportTextData';

@mapContext(ctx => ({
  projectManager: ctx.services.projectManager,
  remoteProjectService: ctx.remoteProjectService,
  currentProjectId: ctx.projectService.id,
  exportNativeLocal: projectId => ctx.services.projectManager.exportProject(projectId),
  exportStl: () => ctx.services.export.stlAscii(),
  clone: projectId => ctx.services.projectManager.cloneProject(projectId, true),
  rename: projectId => ctx.services.projectManager.renameProject(projectId, true),
  remove: projectId => ctx.services.projectManager.deleteProject(projectId),
}))
@connect(streams => streams.storage.update)
export class ProjectManager extends React.Component {

  state = {
    remoteProjects: null,
    signedIn: false,
  };

  componentDidMount() {
    this.loadRemoteProjects();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.loadRemoteProjects();
    }
  }

  loadRemoteProjects() {
    const {remoteProjectService} = this.props;
    if (!remoteProjectService) {
      return;
    }
    remoteProjectService.list()
      .then(remoteProjects => {
        this.setState({
          remoteProjects: remoteProjects || null,
          signedIn: !!remoteProjects,
        });
      })
      .catch(error => console.error(error));
  }

  downloadNative(project) {
    if (!project.uuid) {
      this.props.exportNativeLocal(project.id);
      return;
    }
    this.props.remoteProjectService.load(project.uuid)
      .then(remoteProject => {
        if (!remoteProject) {
          alert('Sign in through the Login link to download database-saved JSketcher projects.');
          return;
        }
        exportTextData(JSON.stringify(remoteProject.data, null, 2), safeFileName(project.name || project.uuid) + '.json');
      })
      .catch(error => {
        console.error(error);
        alert('Native project download failed.');
      });
  }

  downloadStl(project) {
    const projectId = project.uuid || project.id;
    if (projectId !== this.props.currentProjectId) {
      alert('Open this project first, then use Download STL. STL export uses the currently loaded model.');
      return;
    }
    this.props.exportStl();
  }

  render() {
    const {projectManager} = this.props;
    const localProjects = projectManager.listProjects();
    const accountProjects = this.state.remoteProjects || [];
    return <div className={ls.root}>
      <Folder title='Project List'>
        <div className={cmn.scrollable}>
          {this.state.signedIn ? this.renderSignedInProjects(accountProjects, localProjects) : this.renderLocalProjects(localProjects)}
        </div>
      </Folder>
    </div>
  }

  renderSignedInProjects(accountProjects, localProjects) {
    return <React.Fragment>
      <Section label={<span><Fa icon='database'/> Account projects</span>} defaultOpen={true}>
        {accountProjects.length
          ? accountProjects.map(p => this.renderProject(p))
          : <div className={ls.empty}>No account projects saved yet.</div>}
      </Section>
      <Section label={<span><Fa icon='hdd-o'/> Browser-only projects</span>} defaultOpen={false}>
        <div className={ls.warning}>
          These are stored only in this browser. Download them or save them again while signed in to keep them with your account.
        </div>
        {localProjects.length
          ? localProjects.map(p => this.renderProject(p))
          : <div className={ls.empty}>No browser-only projects found.</div>}
      </Section>
    </React.Fragment>;
  }

  renderLocalProjects(localProjects) {
    return <React.Fragment>
      <div className={ls.warning}>
        You are not signed in. This list only shows browser-only projects stored on this device.
      </div>
      {localProjects.length
        ? localProjects.map(p => this.renderProject(p))
        : <div className={ls.empty}>No browser-only projects found.</div>}
    </React.Fragment>;
  }

  renderProject(p) {
    return <Section key={p.uuid || p.id}
                    label={<ContextMenu items={
                      <React.Fragment>
                        <ContextMenuItem label='Download Native' icon={<Fa fw icon='download' />}
                                         onClick={() => this.downloadNative(p)}/>
                        <ContextMenuItem label='Download STL' icon={<Fa fw icon='cube' />}
                                         onClick={() => this.downloadStl(p)}/>
                        {!p.uuid && <ContextMenuItem label='Clone' icon={<Fa fw icon='copy' />}
                                         onClick={() => this.props.clone(p.id)}/>}
                        {!p.uuid && <ContextMenuItem label='Rename' icon={<Fa fw icon='pencil' />}
                                         onClick={() => this.props.rename(p.id)}/>}
                        {!p.uuid && <ContextMenuItem label='Delete' icon={<Fa className={cmn.dangerColor} fw icon='remove' />}
                                         onClick={() => this.props.remove(p.id)}/>}
                      </React.Fragment>
                    }>
                      <a href={projectHref(p)} target="_blank">
                        <Fa icon='file'/> {p.name || p.id}
                      </a>
                    </ContextMenu>}>
      {p.sketches && p.sketches.length && <Section label={<span><Fa icon='image'/> Sketches</span>} defaultOpen={true}>
        {p.sketches.map(sketch => <Section key={sketch} label={sketch}/>)}
      </Section>}
    </Section>;
  }
  
}

function projectHref(project) {
  if (!project.uuid) {
    return '?' + project.id;
  }
  return '?' + project.uuid + '&name=' + encodeURIComponent(project.name || project.uuid);
}

function safeFileName(name) {
  return String(name || 'jsketcher-project')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\.+$/, '') || 'jsketcher-project';
}
