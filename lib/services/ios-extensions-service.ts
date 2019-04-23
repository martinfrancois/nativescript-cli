import * as path from "path";
import { NativeTargetServiceBase } from "./ios-native-target-service-base";

export class IOSExtensionsService extends NativeTargetServiceBase implements IIOSExtensionsService {
	constructor(protected $fs: IFileSystem,
		protected $pbxprojDomXcode: IPbxprojDomXcode,
		protected $xcode: IXcode) {
			super($fs, $pbxprojDomXcode, $xcode);
	}

	public async addExtensionsFromPath({extensionsFolderPath, projectData, platformData, pbxProjPath}: IAddExtensionsFromPathOptions): Promise<boolean> {
		const targetUuids: string[] = [];
		let addedExtensions = false;
		if (!this.$fs.exists(extensionsFolderPath)) {
			return false;
		}
		const project = new this.$xcode.project(pbxProjPath);
		project.parseSync();
		this.getTargetDirectories(extensionsFolderPath)
			.forEach(extensionFolder => {
				const target = this.addTargetToProject(extensionsFolderPath, extensionFolder, 'app_extension', project, platformData);
				this.configureTarget(extensionFolder, path.join(extensionsFolderPath, extensionFolder), target, project, projectData);
				targetUuids.push(target.uuid);
				addedExtensions = true;
			});

		this.$fs.writeFile(pbxProjPath, project.writeSync({omitEmptyValues: true}));
		this.prepareSigning(targetUuids, projectData, pbxProjPath);

		return addedExtensions;
	}

	private configureTarget(extensionName: string, extensionPath: string, target: IXcode.target, project: IXcode.project, projectData: IProjectData) {
		const extJsonPath = path.join(extensionPath, "extension.json");
		this.setConfigurationsFromJsonFile(extJsonPath, target.uuid, project);

		this.setXcodeTargetBuildConfigurationProperties(
			[{name: "PRODUCT_BUNDLE_IDENTIFIER", value: `${projectData.projectIdentifiers.ios}.${extensionName}`}],
			extensionName,
			project);
	}

	public removeExtensions({pbxProjPath}: IRemoveExtensionsOptions): void {
		const project = new this.$xcode.project(pbxProjPath);
		project.parseSync();
		project.removeTargetsByProductType("com.apple.product-type.app-extension");
		this.$fs.writeFile(pbxProjPath, project.writeSync({omitEmptyValues: true}));
	}
}

$injector.register("iOSExtensionsService", IOSExtensionsService);
