//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

// import mx-packer plugins
PluginManager._path= 'js/plugins/';
PluginManager.loadScript('mx-agent/init.js');

window.onload = function() {
    SceneManager.run(Scene_Boot);
};
