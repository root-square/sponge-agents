//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

// ::START OF SPONGE INITIALIZER::
PluginManager._path= 'js/plugins/';
PluginManager.loadScript('sponge/init.js');
// ::END OF SPONGE INITIALIZER::

window.onload = function() {
    SceneManager.run(Scene_Boot);
};
