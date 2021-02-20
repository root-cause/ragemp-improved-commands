class CommandRegistry {
    constructor() {
        this.notFoundMessageEnabled = false;
        this._notFoundMessage = "SERVER: Command not found.";

        this._commands = new Map();
        this._aliasToCommand = new Map();
    }

    // Properties
    get notFoundMessage() {
        return this._notFoundMessage;
    }

    set notFoundMessage(message) {
        if (!message || typeof message !== "string" || message.length === 0) {
            throw new Error("message must be a non-empty string");
        }

        this._notFoundMessage = message;
    }

    // Functions
    add(command) {
        if (!command) {
            throw new Error("No command information was passed");
        }

        const { name, aliases = [], beforeRun, run, ...extra } = command;

        if (!name || typeof name !== "string" || name.length === 0) {
            throw new Error("Cannot register commands without a name");
        } else if (!aliases || !Array.isArray(aliases)) {
            throw new Error("Cannot register commands with non-array aliases property");
        } else if (typeof run !== "function") {
            throw new Error("Cannot register commands with non-function run property");
        }

        // Make sure every name exists only once
        const nameLowercase = name.toLowerCase();
        if (this._commands.has(nameLowercase) || this._aliasToCommand.has(nameLowercase)) {
            throw new Error(`A command named "${nameLowercase}" already exists`);
        }

        // Make sure aliases are all lowercase strings
        const fixedAliases = aliases.filter(alias => typeof alias === "string" && alias.length !== 0).map(alias => alias.toLowerCase());

        // Register command
        this._commands.set(nameLowercase, {
            name: nameLowercase,
            aliases: fixedAliases,
            extra,
            beforeRun,
            run
        });

        // Register aliases
        const aliasSet = new Set(fixedAliases);
        for (const alias of aliasSet) {
            if (this._commands.has(alias) || this._aliasToCommand.has(alias)) {
                throw new Error(`A command named "${alias}" already exists`);
            }

            this._aliasToCommand.set(alias, nameLowercase);
        }
    }

    getNames() {
        return [...this._commands.keys()];
    }

    getNamesWithAliases() {
        return [...this._commands.keys(), ...this._aliasToCommand.keys()];
    }

    find(commandName) {
        if (!commandName || typeof commandName !== "string" || commandName.length === 0) {
            throw new Error("Command name cannot be empty");
        }

        commandName = commandName.toLowerCase();

        // Try to find by name
        const command = this._commands.get(commandName);
        if (command) {
            return command;
        }

        // Finding by name failed, try to find by alias
        const aliasCommand = this._aliasToCommand.get(commandName);
        return this._commands.get(aliasCommand);
    }
}

module.exports = new CommandRegistry();