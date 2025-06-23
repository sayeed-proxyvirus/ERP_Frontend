import AxiosServices from './AxiosServices'
import Configurations from '../configurations/Configurations'

const axiosServices = new AxiosServices()
const configurations = new Configurations()

export default class AuthServices {
  // SignUp(data) {
  //   return axiosServices.post(Configurations.SignUp, data, false)
  // }

  SignIn(data) {
    return axiosServices.post(configurations.SignIn, data, false)
  }
}
