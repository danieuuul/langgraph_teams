import * as fs from 'fs/promises'

export const WORKING_DIRECTORY = './temp'
fs.mkdir(WORKING_DIRECTORY, { recursive: true })
