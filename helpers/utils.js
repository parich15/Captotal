export const utils = () => {
    const truncar = (txt, num = 255) =>{
       return txt.slice(0, num).concat('...')
    }

    return {
        truncar
    }
}