import Generator from "yeoman-generator";

export type GeneratorArgs<
	T extends Generator.GeneratorOptions = Generator.GeneratorOptions,
> = ConstructorParameters<typeof Generator<T>>[0];
