let gsapLoader = null

export const loadGsap = async () => {
  if (!gsapLoader) {
    gsapLoader = import('gsap').then(module => module.default)
  }

  return gsapLoader
}
