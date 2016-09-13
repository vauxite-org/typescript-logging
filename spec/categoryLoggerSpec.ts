import {Category, CategoryLogger} from "../src/CategoryLogger";
import {CategoryServiceFactory} from "../src/CategoryService";


describe("Categories", () => {

  it("Plays with categories", () => {
    let root1 = new Category("root1");
    let root2 = new Category("root2");

    let child1 = new Category("root1_child1", root1);
    let root2Child1 = new Category("root2_child2", root2);


    let child11 = new Category("root1_child1_child11", child1);
    let child12 = new Category("root1_child1_child12", child1);

    expect(root1.parent).toBeNull();
    expect(child1.parent == root1).toBeTruthy();
    expect(root1.children.length).toEqual(1);
    expect(child1.children.length).toEqual(2);
    expect(child11.parent == child1).toBeTruthy();
    expect(child12.parent == child1).toBeTruthy();
    expect(child11.children.length).toEqual(0);
    expect(child12.children.length).toEqual(0);

    expect(root2.parent).toBeNull();
    expect(root2.children.length).toEqual(1);
    expect(root2Child1.parent == root2).toBeTruthy();
    expect(root2Child1.parent == root1).toBeFalsy();
  });

  it("Fails when forbidden character is used in category",() => {
    expect(() => new Category("abc")).not.toThrow();
    expect(() => new Category("a#")).toThrow();
  });
});

describe("CategoryServiceFactory", () => {

  let root1: Category, child1: Category, child11: Category, child12: Category;
  let logger: CategoryLogger;

  beforeEach(() => {
    CategoryServiceFactory.clear();
    root1 = new Category("root1");
    child1 = new Category("child1", root1);
    child11 = new Category("child11", child1);
    child12 = new Category("child12", child1);
    logger = CategoryServiceFactory.getLogger(root1);
  });

  afterEach(() => {
    root1 = null;
    child1 = null;
    child11 = null;
    child12 = null;
    logger = null;
  });

  it("Defaults works", () => {
    expect(root1).not.toBeNull();
    expect(logger).not.toBeNull();

    logger.error("Hello World!!!", new Error("X"), child1);
    logger.info("Hello World!!!", child12);
  });

  it("All categories have runtime settings", () => {
    const service = CategoryServiceFactory.getRuntimeSettings();
    expect(service.getCategorySettings(root1)).not.toBeNull();
    expect(service.getCategorySettings(child1)).not.toBeNull();
    expect(service.getCategorySettings(child11)).not.toBeNull();
    expect(service.getCategorySettings(child12)).not.toBeNull();
  });

  it("Only allows to fetch by root loggers", () => {
    expect(() => CategoryServiceFactory.getLogger(child1)).toThrow();
    expect(() => CategoryServiceFactory.getLogger(child11)).toThrow();
    expect(() => CategoryServiceFactory.getLogger(child12)).toThrow();
  });

  it("Allows adding root category dynamically", () => {
    // This will register it automatically.
    const extraRoot = new Category("root2");
    const child = new Category("someChild", extraRoot);

    const anotherLogger = CategoryServiceFactory.getLogger(extraRoot);
    expect(anotherLogger).not.toBeNull();
    expect(anotherLogger !== logger).toBeTruthy();

    const service = CategoryServiceFactory.getRuntimeSettings();
    expect(service.getCategorySettings(extraRoot)).not.toBeNull();
    expect(service.getCategorySettings(child)).not.toBeNull();
  });


  it("Allows adding child category dynamically", () => {
    const child121 = new Category("hello", child12);
    expect(CategoryServiceFactory.getRuntimeSettings().getCategorySettings(child121)).not.toBeNull();
    expect(child121.getCategoryPath()).toEqual("root1#child1#child12#hello");
  });

  it("Will return the same logger for root", () => {
    const anotherLogger = CategoryServiceFactory.getLogger(root1);
    expect(anotherLogger === logger).toBeTruthy();
  });
  
});