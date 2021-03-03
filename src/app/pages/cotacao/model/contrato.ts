import {Cobertura} from './cobertura';

export class Contrato {
  agravo: number;
  valorMaximoCobertura: number;
  valorSelecionado: number;
  coberturaBasica: Cobertura [];
  coberturaOpcional: Cobertura[];
  valor: number;

  constructor(agravo: number = 0, valorMaximoCobertura: number = 0, valorSelecionado: number = 0,
              coberturaBasica: Cobertura[] = [], coberturaOpcional: Cobertura[] = [], valor: number = 0) {
    this.agravo = agravo;
    this.valorMaximoCobertura = valorMaximoCobertura;
    this.valorSelecionado = valorSelecionado;
    this.coberturaBasica = coberturaBasica;
    this.coberturaOpcional = coberturaOpcional;
    this.valor = valor;
  }
}
