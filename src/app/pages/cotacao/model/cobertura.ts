export class Cobertura {
  id: number;
  rotulo: string;
  descricao: string;
  capitalPorCobertura: number;
  valor: number;
  valorAgravo: number;
  ativo: boolean;
  desabilitar: boolean;

  constructor(id: number = 0, rotulo: string = '', descricao: string = '', capitalPorCobertura: number = 0,
              valor: number = 0, valorAgravo: number = 0, ativo: boolean = false, desabilitar: boolean = false) {
    this.id = id;
    this.rotulo = rotulo;
    this.descricao = descricao;
    this.capitalPorCobertura = capitalPorCobertura;
    this.valor = valor;
    this.valorAgravo = valorAgravo;
    this.ativo = ativo;
    this.desabilitar = desabilitar;
  }
}
