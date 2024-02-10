"use strict";

const util = require("util");
const exec = util.promisify(require("child_process").exec);

/*
 * バイナリファイルの名前をbootstrapにする
 * 1Functionにつき、一つbootstrapを作成し、それをzip化する。zipファイルの名前は関数名
 */

class ExamplePlugin {
  BaseDir = "./";
  PluginName = "example";
  DefaultOutputDir = "./.bin";

  /**
   * @type {PluginOption}
   */
  Options;

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.hooks = {
      initialize: () => this.init(),
      "before:package:createDeploymentArtifacts": () => this.beforePackage(),
      "before:deploy:function:packageFunction": () => this.beforeDeploy(),
    };

    this.Options = this.getOptions();
  }

  init() {
    console.log("##### example plugin init ######");
  }

  // sls deploy
  beforeDeploy() {
    console.log("##### example plugin beforeDeploy ######");
    const service = this.serverless.service;
    console.log(service.functions);
  }

  // sls package
  beforePackage() {
    console.log("##### example plugin beforePackage ######");
    this.buildFunction();
  }

  getOptions() {
    /**
     * @returns {PluginOption}
     */
    const pluginOptions = this.serverless.service.custom[this.PluginName];
    if (pluginOptions.cmd == null) {
      throw new Error("cmd is null");
    }
    let outputDir = pluginOptions.outputDir;
    if (outputDir == null) {
      outputDir = this.DefaultOutputDir;
    }
    return new PluginOption(
      pluginOptions.cmd,
      pluginOptions.ignoreFunctions,
      outputDir,
    );
  }

  async buildFunction() {
    const funcList = this.serverless.service.functions;
    for (const funcName in funcList) {
      if (this.Options.IgnoreFunctions.includes(funcName)) {
        this.serverless.cli.log(`Skip function: ${funcName}`);
        continue;
      }
      const func = funcList[funcName];

      // バイナリファイルを`bootstrap`のファイル名で作成
      const buildCommand =
        `${this.Options.GoCommand} -o ${this.Options.OutputDir}/bootstrap ${func.handler}`;
      await this.runCommand(buildCommand);

      // Function名でzip化
      const zipCommand =
        `zip -j ${this.Options.OutputDir}/${funcName}.zip ${this.Options.OutputDir}/bootstrap`;
      await this.runCommand(zipCommand);

      // artifactにzipファイルのパスを設定
      this.serverless.service.functions[funcName].package = {
        individually: true,
        artifact: `${this.Options.OutputDir}/${funcName}.zip`,
      };
    }
  }

  async runCommand(command) {
    await exec(command, { cwd: this.BaseDir });
  }
}

class PluginOption {
  constructor(goCommand, ignoreFunctions, outputDir) {
    this.GoCommand = goCommand;
    this.IgnoreFunctions = ignoreFunctions;
    this.OutputDir = outputDir;
  }

  /**
   * @type {string}
   */
  GoCommand;

  /**
   * @type {Array<string>}
   */
  IgnoreFunctions;

  /**
   * @type {string}
   */
  OutputDir;
}

module.exports = ExamplePlugin;
