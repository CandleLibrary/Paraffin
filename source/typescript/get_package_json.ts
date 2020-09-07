import URL from "@candlefw/url";

import { PackageJSONData } from "./types/package";

/**
 * Locates the nearest package.json file. Searches up the directory structure until one is found.
 * If no package.json file can be found, then the return object property FOUND will be false.
 */
export async function getPackageJsonObject(cwd: string = URL.getCWDURL() + "")
    : Promise<{ package: PackageJSONData, package_dir: string; FOUND: boolean; }> {

    let
        pkg_file_path: URL = URL.resolveRelative("./package.json", cwd),
        i = pkg_file_path.path.split("/").filter(s => s !== "..").length,
        pkg: PackageJSONData = null,
        FOUND = false;



    while (i-- >= 0) {

        try {
            if (await pkg_file_path.DOES_THIS_EXIST()) {
                pkg = <PackageJSONData>await pkg_file_path.fetchJSON();
                FOUND = true;
                break;
            }
        } catch (e) {
            //Suppress errors - Don't really care if there is no file found. That can be handled by the consumer.
        }
        pkg_file_path = URL.resolveRelative("../package.json", pkg_file_path);
    }

    return { package: <PackageJSONData>pkg, package_dir: FOUND ? pkg_file_path.dir : "", FOUND };
}