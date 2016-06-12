function bootstrap(element, applications) {
	applications.unshift('TB');
	createInjector(applications);
}
