// @flow

/// Represents a source file with all the config needed to turn it into output.
declare interface SourceFile {
    inPath: string, /// Path of the source file.
    data: string, /// File content - read from inPath, then changed repeatedly, then written to outPath.
    outPath?: string, /// Path to write the output file.
    ext?: string, /// File extension to apply to filename when creating outPath.
    fileConfig?: FileConfig,
    groupConfig?: GroupConfig,
    siteConfig?: SiteConfig
}

/// Config unique to the file, partially loaded from front-matter, used by layouts.
declare interface FileConfig {
    layout?: string, /// A layout to be applied to this file.
    url?: string, /// The URL of this file within the site.
    description?: string, /// Page description for metadata, indexes.
    title?: string, /// Page title.
    date?: string /// Page date, must be ISO8601.
}

/// Site wide config, used in layouts.
declare interface SiteConfig {
    title: string, /// Overall site title used for masthead and metadata.
    baseUrl: string, /// The canonical base url of all pages.
    description: string, /// Description of the site, used for metadata
    nav: string[] /// Pages names for the top-level nav, usually (home,about,archive).
}

/// Shared config for a group of files.
declare interface GroupConfig {
    name: string, /// A name for this config, only used for error messages.
    inDir: string, /// The dir containing the source files.
    outDir: string, /// The dir to put the output files.
    relUrl: string, /// Url joined onto the front relative files paths to create the correct url ('' for top level).
    filePredicate: (filePath: string)=>boolean, // A function to select the files that belong in this group.
    dirPredicate: (dirPath: string)=>boolean, // A function to select the sub-folders that belong in this group.
    /// A function that reads the source file, processes it and then writes the output.
    proc: (filePath: string, data: string, groupConfig: GroupConfig, siteConfig: SiteConfig)=>Promise<void>
}